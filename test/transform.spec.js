'use strict';
const Inject = require('../src/inject');
const sinon = require('sinon');
const Parser = require('../src/parser');

describe('Transform', () => {
  const mock_hexo = {
    log: {
      warn: sinon.stub(),
      debug: sinon.stub(),
      error: sinon.stub()
    }
  };
  const inject = new Inject(mock_hexo);
  const partial = '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title></title>\n  </head>';
  const html = '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8">\n    <title></title>\n  </head>\n  <body class=\'some-class\'>\n    <div>body and stuff</div>\n  </body>\n</html>';
  const injected = '<!DOCTYPE html>\n<html>\n  <head>\n    <!-- hexo-inject:begin --><link src=\'foo/style.css\'><!-- hexo-inject:end --><meta charset="utf-8">\n    <title></title><!-- hexo-inject:begin --><script src=\'foo/head-script.js\'></script><!-- hexo-inject:end -->\n  </head>\n  <body class=\'some-class\'>\n    <!-- hexo-inject:begin --><h1 class=\'foo-h1\'>heading</h1><!-- hexo-inject:end --><div>body and stuff</div><!-- hexo-inject:begin --><script type=\'test/foo\'>this is in body</script><!-- hexo-inject:end -->\n  </body>\n</html>';
  before(() => {
    inject.headBegin.link({ src: 'foo/style.css' });
    inject.headEnd.script({ src: 'foo/head-script.js' });
    inject.bodyBegin.tag('h1', { class: 'foo-h1' }, 'heading', true);
    return inject.bodyEnd.script({ type: 'test/foo' }, 'this is in body');
  });
  it('should transform complete HTML', () => {
    return inject._transform(html, { source: 'test' }).should.eventually.equal(injected);
  });
  it('should not transform incomplete HTML', () => {
    inject._transform(partial, { source: 'test-partial' }).should.equal(partial);
    mock_hexo.log.debug.calledTwice.should.be.true;
    return mock_hexo.log.debug.calledWithMatch('[hexo-inject] SKIP: test-partial').should.be.true;
  });
  return it('should overwrite existing injeciton blocks', () => {
    // eslint-disable-next-line no-unused-vars
    const parser = new Parser();
    return inject._transform(injected, { source: 'test' }).should.eventually.equal(injected);
  });
});

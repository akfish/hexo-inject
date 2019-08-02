(function() {
  var Inject, Parser, sinon;

  Inject = require('../lib/inject');

  sinon = require('sinon');

  Parser = require('../lib/parser');

  describe('Transform', function() {
    var html, inject, injected, mock_hexo, partial;
    mock_hexo = {
      log: {
        warn: sinon.stub(),
        debug: sinon.stub(),
        error: sinon.stub()
      }
    };
    inject = new Inject(mock_hexo);
    partial = "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <title></title>\n  </head>";
    html = "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <title></title>\n  </head>\n  <body class='some-class'>\n    <div>body and stuff</div>\n  </body>\n</html>";
    injected = "<!DOCTYPE html>\n<html>\n  <head>\n    <!-- hexo-inject:begin --><link src='foo/style.css'><!-- hexo-inject:end --><meta charset=\"utf-8\">\n    <title></title><!-- hexo-inject:begin --><script src='foo/head-script.js'></script><!-- hexo-inject:end -->\n  </head>\n  <body class='some-class'>\n    <!-- hexo-inject:begin --><h1 class='foo-h1'>heading</h1><!-- hexo-inject:end --><div>body and stuff</div><!-- hexo-inject:begin --><script type='test/foo'>this is in body</script><!-- hexo-inject:end -->\n  </body>\n</html>";
    before(function() {
      inject.headBegin.link({
        src: 'foo/style.css'
      });
      inject.headEnd.script({
        src: 'foo/head-script.js'
      });
      inject.bodyBegin.tag('h1', {
        class: 'foo-h1'
      }, 'heading', true);
      return inject.bodyEnd.script({
        type: 'test/foo'
      }, 'this is in body');
    });
    it('should transform complete HTML', function() {
      return inject._transform(html, {
        source: 'test'
      }).should.eventually.equal(injected);
    });
    it('should not transform incomplete HTML', function() {
      inject._transform(partial, {
        source: 'test-partial'
      }).should.equal(partial);
      mock_hexo.log.debug.calledTwice.should.be.true;
      return mock_hexo.log.debug.calledWithMatch('[hexo-inject] SKIP: test-partial').should.be.true;
    });
    return it('should overwrite existing injeciton blocks', function() {
      var parser;
      parser = new Parser();
      return inject._transform(injected, {
        source: 'test'
      }).should.eventually.equal(injected);
    });
  });

}).call(this);

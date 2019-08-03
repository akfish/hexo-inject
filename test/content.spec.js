const Inject = require('../src/inject');
const Promise = require('bluebird');
const _ = require('underscore');
const sinon = require('sinon');

describe('Content', () => {
  const inject = new Inject();
  describe('helper', () => {
    beforeEach(() => sinon.stub(inject, 'raw'));

    afterEach(() => inject.raw.restore());

    const should_generate_raw_html = expected => {
      inject.raw.calledOnce.should.be.true;
      inject.raw.calledWith('test').should.be.true;

      const [, html, opts] = inject.raw.getCall(0).args;

      html.should.be.a('function');
      expect(opts).to.be.undefined;
      return html().should.eventually.equal(expected);
    };

    it('tag', () => {
      inject.tag('test', 'h1', { class: 'foo' }, 'heading', true);
      return should_generate_raw_html("<h1 class='foo'>heading</h1>");
    });
    it('script', () => {
      inject.script('test', { src: 'foo/bar.js' });
      return should_generate_raw_html("<script src='foo/bar.js'></script>");
    });
    it('script - with content', () => {
      inject.script('test', { type: 'text/test' }, 'this is a test');
      return should_generate_raw_html("<script type='text/test'>this is a test</script>");
    });
    it('style', () => {
      inject.style('test', { media: 'screen' }, '* { display: none }');
      return should_generate_raw_html("<style media='screen'>* { display: none }</style>");
    });
    return it('link', () => {
      inject.link('test', { src: 'foo/style.css' });
      return should_generate_raw_html("<link src='foo/style.css'>");
    });
  });
  describe('tag', () => {
    const src = 'foo bar baz';
    it('._buildHTMLTag - link', () => {
      const css_attrs = {
        src: '/foo/bar.css',
        'data-foo': function(s) {
          s.should.equal(src);
          return 'foo';
        },
        'data-bar': Promise.resolve('bar').delay(1000)
      };
      return inject._buildHTMLTag('link', css_attrs, null, false, src).should.eventually.equal("<link src='/foo/bar.css' data-foo='foo' data-bar='bar'>");
    });
    return it('._buildHTMLTag - script', () => {
      const js_attrs = {
        type: 'text/foo-config',
        'data-foo': function(s) {
          s.should.equal(src);
          return 'foo';
        },
        'data-bar': Promise.resolve('bar').delay(1000)
      };
      const content = 'var foo = {}';
      const getContent = s => {
        s.should.equal(src);
        return content;
      };
      return inject._buildHTMLTag('script', js_attrs, getContent, true, src).should.eventually.equal(`<script type='text/foo-config' data-foo='foo' data-bar='bar'>${content}</script>`);
    });
  });
  return describe('resolve', () => {
    const src = 'foo bar baz';
    it('sync', () => {
      const content = {
        html: 'html content',
        opts: {
          shouldInject: false
        }
      };
      inject._resolveContent(src, content).should.eventually.deep.equal({
        html: content.html,
        shouldInject: false
      });
      return inject._resolveContent(src, _.omit(content, 'opts')).should.eventually.deep.equal({
        html: content.html,
        shouldInject: true
      });
    });
    it('async - function', () => {
      const content = {
        html: function(s) {
          s.should.equal(src);
          return Promise.resolve('html content').delay(1000);
        },
        opts: {
          shouldInject: function(s) {
            s.should.equal(src);
            return false;
          }
        }
      };
      return inject._resolveContent(src, content).should.eventually.deep.equal({
        html: 'html content',
        shouldInject: false
      });
    });
    return it('async - promise', () => {
      const content = {
        html: Promise.resolve('html content').delay(1000),
        opts: {
          shouldInject: Promise.resolve(false).delay(300)
        }
      };
      return inject._resolveContent(src, content).should.eventually.deep.equal({
        html: 'html content',
        shouldInject: false
      });
    });
  });
});

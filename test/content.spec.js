(function() {
  var Inject, Promise, _, sinon;

  Inject = require('../lib/inject');

  Promise = require('bluebird');

  _ = require('underscore');

  sinon = require('sinon');

  describe('Content', function() {
    var inject;
    inject = new Inject();
    describe('helper', function() {
      var should_generate_raw_html;
      beforeEach(function() {
        return sinon.stub(inject, 'raw');
      });
      afterEach(function() {
        return inject.raw.restore();
      });
      should_generate_raw_html = function(expected) {
        var html, opts, x;
        inject.raw.calledOnce.should.be.true;
        inject.raw.calledWith('test').should.be.true;
        [x, html, opts] = inject.raw.getCall(0).args;
        html.should.be.a('function');
        expect(opts).to.be.undefined;
        return html().should.eventually.equal(expected);
      };
      it('tag', function() {
        inject.tag('test', 'h1', {
          class: 'foo'
        }, 'heading', true);
        return should_generate_raw_html("<h1 class='foo'>heading</h1>");
      });
      it('script', function() {
        inject.script('test', {
          src: 'foo/bar.js'
        });
        return should_generate_raw_html("<script src='foo/bar.js'></script>");
      });
      it('script - with content', function() {
        inject.script('test', {
          type: 'text/test'
        }, 'this is a test');
        return should_generate_raw_html("<script type='text/test'>this is a test</script>");
      });
      it('style', function() {
        inject.style('test', {
          media: 'screen'
        }, '* { display: none }');
        return should_generate_raw_html("<style media='screen'>* { display: none }</style>");
      });
      return it('link', function() {
        inject.link('test', {
          src: 'foo/style.css'
        });
        return should_generate_raw_html("<link src='foo/style.css'>");
      });
    });
    describe('tag', function() {
      var src;
      src = 'foo bar baz';
      it('._buildHTMLTag - link', function() {
        var css_attrs;
        css_attrs = {
          src: '/foo/bar.css',
          'data-foo': function(s) {
            s.should.equal(src);
            return 'foo';
          },
          'data-bar': Promise.resolve('bar').delay(1000)
        };
        return inject._buildHTMLTag('link', css_attrs, null, false, src).should.eventually.equal("<link src='/foo/bar.css' data-foo='foo' data-bar='bar'>");
      });
      return it('._buildHTMLTag - script', function() {
        var content, getContent, js_attrs;
        js_attrs = {
          type: 'text/foo-config',
          'data-foo': function(s) {
            s.should.equal(src);
            return 'foo';
          },
          'data-bar': Promise.resolve('bar').delay(1000)
        };
        content = 'var foo = {}';
        getContent = function(s) {
          s.should.equal(src);
          return content;
        };
        return inject._buildHTMLTag('script', js_attrs, getContent, true, src).should.eventually.equal(`<script type='text/foo-config' data-foo='foo' data-bar='bar'>${content}</script>`);
      });
    });
    return describe('resolve', function() {
      var src;
      src = 'foo bar baz';
      it('sync', function() {
        var content;
        content = {
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
      it('async - function', function() {
        var content;
        content = {
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
      return it('async - promise', function() {
        var content;
        content = {
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

}).call(this);

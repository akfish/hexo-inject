(function() {
  var Inject, _, path, sinon;

  Inject = require('../lib/inject');

  sinon = require('sinon');

  path = require('path');

  _ = require('underscore');

  describe('Require', function() {
    var css_asset, hexo, inject, js_asset, mock_module, swig_asset;
    hexo = new Hexo(__dirname);
    inject = new Inject(hexo);
    beforeEach(function() {
      return sinon.stub(inject, 'raw');
    });
    afterEach(function() {
      return inject.raw.restore();
    });
    swig_asset = './asset/foo.swig';
    js_asset = './asset/foo.js';
    css_asset = './asset/foo.css';
    mock_module = function(p, content) {
      var m, m_path;
      m_path = path.resolve(__dirname, p);
      m = path.parse(m_path);
      m.filePath = m_path;
      if (content != null) {
        m.content = content;
      }
      return m;
    };
    it('should resolve module path from callsite', function() {
      var error, m, m1, m2;
      sinon.stub(inject, '_loadModule');
      m = mock_module(js_asset);
      try {
        inject.require('test', js_asset);
        inject.headBegin.require(js_asset);
        inject._loadModule.calledTwice.should.be.true;
        m1 = inject._loadModule.getCall(0).args[0];
        m2 = inject._loadModule.getCall(1).args[0];
        m1.should.deep.equal(m);
        return m1.should.deep.equal(m2);
      } catch (error1) {
        error = error1;
        throw error;
      } finally {
        inject._loadModule.restore();
      }
    });
    describe('render', function() {
      before(function() {
        return hexo.init();
      });
      it('should render content with hexo renderer', function() {
        var m;
        m = mock_module(swig_asset);
        return inject._loadModule(m, {
          inline: true,
          data: {
            test: 'foo'
          }
        }).should.eventually.equal('this is a foo\n');
      });
      it('should replace module extension name with output\'s', function() {
        var m;
        m = mock_module(swig_asset);
        return inject._loadModule(m, {
          inline: true,
          data: {
            test: 'foo'
          }
        }).then(function() {
          return m.ext.should.equal('.html');
        });
      });
      return it('should delay render if opts.inline == false', function() {
        var m;
        m = mock_module(swig_asset);
        return inject._loadModule(m, {
          inline: false,
          data: {
            test: 'foo'
          }
        }).should.eventually.equal('').then(function() {
          var route_data;
          route_data = inject.router._routes[0].data;
          route_data.should.be.a('function');
          return route_data();
        }).should.eventually.equal('this is a foo\n');
      });
    });
    describe('loader', function() {
      it('should returns as-is if not available', function() {
        var m;
        m = mock_module(swig_asset, 'foo content');
        return inject.loader.load(m, {
          inline: true
        }).should.eventually.equal('foo content');
      });
      it('should should have empty content if opts.inline == false', function() {
        var m;
        m = mock_module(swig_asset, 'foo content');
        return inject.loader.load(m, {
          inline: false
        }).should.eventually.equal('');
      });
      it('built-in .js loader opts.inline == true', function() {
        var m;
        m = mock_module(js_asset, 'var foo = 1;');
        return inject.loader.load(m, {
          inline: true
        }).should.eventually.equal('<script>var foo = 1;</script>');
      });
      it('built-in .js loader opts.inline == false', function() {
        var m, opts;
        m = mock_module(js_asset, 'var foo = 1;');
        opts = {
          inline: false,
          src: '/injected/foo.js'
        };
        return inject.loader.load(m, opts).should.eventually.equal(`<script src='${opts.src}'></script>`);
      });
      it('built-in .css loader opts.inline == true', function() {
        var m;
        m = mock_module(css_asset, 'body { display: none; }');
        return inject.loader.load(m, {
          inline: true
        }).should.eventually.equal('<style>body { display: none; }</style>');
      });
      it('built-in .css loader opts.inline == false', function() {
        var m, opts;
        m = mock_module(css_asset, 'body { display: none; }');
        opts = {
          inline: false,
          src: '/injected/foo.css'
        };
        return inject.loader.load(m, opts).should.eventually.equal(`<link rel='stylesheet' href='${opts.src}'>`);
      });
      return it('custom loader', function() {
        var m;
        inject.loader.register('.foo', function(content, opts) {
          return `FOO ${content} OOF`;
        });
        m = mock_module('./asset/foo.foo', 'bar');
        return inject.loader.load(m, {
          inline: true
        }).should.eventually.equal('FOO bar OOF');
      });
    });
    return describe('serve', function() {
      beforeEach(function() {
        return inject.router._routes = [];
      });
      it('should serve when opts.inline == false', function() {
        var m;
        m = mock_module(swig_asset);
        return inject._loadModule(m, {
          inline: false,
          data: {
            test: 'foo'
          }
        }).should.eventually.equal('').then(function() {
          var route, route_data;
          inject.router._routes.should.be.an('array').of.length(1);
          route = inject.router._routes[0];
          route.path.should.equal('/injected/foo.html');
          route_data = route.data;
          route_data.should.be.a('function');
          return route_data();
        }).should.eventually.equal('this is a foo\n');
      });
      return it('should not serve when opts.inline == true', function() {
        var m;
        m = mock_module(swig_asset);
        return inject._loadModule(m, {
          inline: true,
          data: {
            test: 'foo'
          }
        }).then(function() {
          return inject.router._routes.should.be.an('array').of.length(0);
        });
      });
    });
  });

}).call(this);

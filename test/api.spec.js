(function() {
  var API, INJECTION_POINTS, Inject, camalize, sinon;

  Inject = require('../lib/inject');

  ({INJECTION_POINTS, API} = require('../lib/const'));

  ({camalize} = require('../lib/util'));

  sinon = require('sinon');

  describe('API', function() {
    var inject, mock_hexo;
    mock_hexo = {
      extend: {
        filter: {
          register: sinon.stub()
        },
        generator: {
          register: sinon.stub()
        }
      },
      execFilter: sinon.stub()
    };
    inject = null;
    before(function() {
      inject = new Inject(mock_hexo);
      return inject.register();
    });
    describe('register', function() {
      it('should expose API via `hexo.inject`', function() {
        mock_hexo.extend.filter.register.calledWith('after_render:html').should.be.true;
        mock_hexo.extend.filter.register.calledWith('after_init').should.be.true;
        mock_hexo.extend.generator.register.calledWith('inject').should.be.true;
        return mock_hexo.inject.should.equal(inject);
      });
      return it.skip('should execute `inject_ready` filter`', function() {
        return mock_hexo.execFilter.calledWith('inject_ready', inject, {
          context: mock_hexo
        }).should.be.true;
      });
    });
    return describe('injection point', function() {
      var should_expose_api;
      before(function() {
        API.forEach(function(i) {
          return sinon.stub(inject, i);
        });
        return inject._initAPI();
      });
      after(function() {
        API.forEach(function(i) {
          return inject[i].restore();
        });
        return inject._initAPI();
      });
      should_expose_api = function(p) {
        var injection_point;
        injection_point = p;
        return it(injection_point, function() {
          var api;
          api = inject[camalize(injection_point)];
          api.should.be.an('object');
          return API.forEach(function(i) {
            api[i].should.be.a('function');
            api[i]('foo', 'bar', 'barz').should.equal(api, 'API calls should be chainable');
            inject[i].calledOn(inject).should.be.true;
            return inject[i].calledWith(injection_point, 'foo', 'bar', 'barz').should.be.true;
          });
        });
      };
      return INJECTION_POINTS.forEach(function(i) {
        return should_expose_api(i);
      });
    });
  });

}).call(this);

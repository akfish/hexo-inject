'use strict';
const Inject = require('../src/inject');
const { INJECTION_POINTS, API } = require('../src/const');
const { camalize } = require('../src/util');
const sinon = require('sinon');

describe('API', () => {
  const mock_hexo = {
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
  let inject = null;
  before(() => {
    inject = new Inject(mock_hexo);
    return inject.register();
  });
  describe('register', () => {
    it('should expose API via `hexo.inject`', () => {
      mock_hexo.extend.filter.register.calledWith('after_render:html').should.be.true;
      mock_hexo.extend.filter.register.calledWith('after_init').should.be.true;
      mock_hexo.extend.generator.register.calledWith('inject').should.be.true;
      return mock_hexo.inject.should.equal(inject);
    });
    return it.skip('should execute `inject_ready` filter`', () => {
      return mock_hexo.execFilter.calledWith('inject_ready', inject, {
        context: mock_hexo
      }).should.be.true;
    });
  });
  return describe('injection point', () => {
    before(() => {
      API.forEach(i => sinon.stub(inject, i));
      return inject._initAPI();
    });
    after(() => {
      API.forEach(i => inject[i].restore());
      return inject._initAPI();
    });
    const should_expose_api = p => {
      const injection_point = p;
      return it(injection_point, () => {
        const api = inject[camalize(injection_point)];
        api.should.be.an('object');
        return API.forEach(i => {
          api[i].should.be.a('function');
          api[i]('foo', 'bar', 'barz').should.equal(api, 'API calls should be chainable');
          inject[i].calledOn(inject).should.be.true;
          return inject[i].calledWith(injection_point, 'foo', 'bar', 'barz').should.be.true;
        });
      });
    };
    return INJECTION_POINTS.forEach(i => should_expose_api(i));
  });
});

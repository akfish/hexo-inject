var _dec, _class;

import _ from "underscore";
import { mixins } from 'core-decorators';
import { Content, Register, Transform, Require } from './mixin';
import { INJECTION_POINTS, API } from './const';
import { camalize } from './util';
import Loader from './loader';
import Router from './router';
import registerBuiltInLoader from './loader/built-in';

let Inject = (_dec = mixins(Content, Register, Transform, Require), _dec(_class = class Inject {
  constructor(hexo) {
    this.hexo = hexo;
    this.loader = new Loader(hexo);
    registerBuiltInLoader(this.loader);
    this.router = new Router(hexo);
    this._initAPI();
  }
  _initAPI() {
    this._injectors = {};
    INJECTION_POINTS.forEach(i => {
      this._injectors[i] = [];
      let api = this[camalize(i)] = _.chain(this).pick(API).mapObject(fn => (...args) => {
        fn.call(this, i, ...args);
        return api;
      }).value();
    });
  }
}) || _class);
export { Inject as default };
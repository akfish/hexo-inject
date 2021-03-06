'use strict';
const Promise = require('bluebird');
const _ = require('lodash');
const { zipObject, mapValues } = _;
const Parser = require('../parser');
const { INJECTION_POINTS } = require('../const');

const Transform = {
  _transform(src, data) {
    const { log } = this.hexo;
    try {
      const doc = Parser.get().parse(src);
      if (!doc.isComplete) throw new Error('Incomplete document');
      return this._doTransform(doc, src, data);
    } catch (e) {
      log.debug(`[hexo-inject] SKIP: ${data.source}`);
      log.debug(e);
    }
    return src;
  },
  _doTransform: Promise.coroutine(function* (doc, src, data) {
    const { log } = this.hexo;
    try {
      const injections = zipObject(INJECTION_POINTS, INJECTION_POINTS.map(this._resolveInjectionPoint.bind(this, src)));
      let resolved = yield Promise.props(injections);
      resolved = mapValues(resolved, value => {
        return _(value)
          .filter(({ shouldInject }) => shouldInject)
          .map('html')
          .value();
      });

      doc.head.clearInjections();
      doc.body.clearInjections();

      doc.head.injectBefore(resolved.head_begin);
      doc.head.injectAfter(resolved.head_end);
      doc.body.injectBefore(resolved.body_begin);
      doc.body.injectAfter(resolved.body_end);

      if (!doc.head.validate()) {
        log.warn('[hexo-inject] rogue injection block detected in <head> section');
        log.debug(doc.head.content);
      }
      if (!doc.body.validate()) {
        log.warn('[hexo-inject] rogue injection block detected in <body> section');
        log.debug(doc.body.content);
      }

      src = doc.content;
    } catch (e) {
      log.error(`[hexo-inject] Error injecting: ${data.source}`);
      log.error(e);
    }
    return src;
  })
};

module.exports = Transform;

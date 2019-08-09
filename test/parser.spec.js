'use strict';
const Parser = require('../src/parser');
const map = require('lodash/map');

describe('Parser', () => {
  const parser = Parser.get();
  const html = '<!DOCTYPE html>\n<html>\n  <head>\n    <!-- hexo-inject:begin -->\n    injected stuff at beginning\n    <!-- hexo-inject:end -->\n    <meta charset="utf-8">\n    <title></title>\n    <!-- hexo-inject:begin -->\n    injected stuff at end\n    <!-- hexo-inject:end -->\n  </head>\n  <body class=\'some-class\'>\n    <!-- hexo-inject:begin -->\n    injected stuff at beginning\n    <!-- hexo-inject:end -->\n    <div>body and stuff</div>\n    <!-- hexo-inject:begin -->\n    injected stuff at end\n    <!-- hexo-inject:end -->\n  </body>\n</html>';
  it('._tokenize', () => {
    const tokens = parser._tokenize(html);
    const content = '';
    map(tokens, 'type').should.deep.equal(['text', 'head_begin', 'injection_begin', 'injection_text', 'injection_end', 'head_text', 'injection_begin', 'injection_text', 'injection_end', 'head_end', 'text', 'body_begin', 'injection_begin', 'injection_text', 'injection_end', 'body_text', 'injection_begin', 'injection_text', 'injection_end', 'body_end', 'text']);
    return map(tokens, 'content').join('').should.equal(html);
  });
  it('.parse', () => {
    const doc = parser.parse(html);
    doc.content.should.equal(html);
    doc.head.should.be.an('object');
    doc.body.should.be.an('object');
    return doc.isComplete.should.be.true;
  });
  it('.parse - missing begin token', () => {
    return expect(() => parser.parse('</body>')).to.throw(SyntaxError, 'No matching \'body_begin\'');
  });
  return it('.parse - missing end token', () => {
    return expect(() => parser.parse('<body>')).to.throw(SyntaxError, 'No matching \'body_end\'');
  });
});

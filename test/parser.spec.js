(function() {
  var Parser, _;

  Parser = require('../lib/parser');

  _ = require('underscore');

  describe("Parser", function() {
    var html, parser;
    parser = Parser.get();
    html = "<!DOCTYPE html>\n<html>\n  <head>\n    <!-- hexo-inject:begin -->\n    injected stuff at beginning\n    <!-- hexo-inject:end -->\n    <meta charset=\"utf-8\">\n    <title></title>\n    <!-- hexo-inject:begin -->\n    injected stuff at end\n    <!-- hexo-inject:end -->\n  </head>\n  <body class='some-class'>\n    <!-- hexo-inject:begin -->\n    injected stuff at beginning\n    <!-- hexo-inject:end -->\n    <div>body and stuff</div>\n    <!-- hexo-inject:begin -->\n    injected stuff at end\n    <!-- hexo-inject:end -->\n  </body>\n</html>";
    it("._tokenize", function() {
      var content, tokens;
      tokens = parser._tokenize(html);
      content = '';
      _.pluck(tokens, 'type').should.deep.equal(['text', 'head_begin', 'injection_begin', 'injection_text', 'injection_end', 'head_text', 'injection_begin', 'injection_text', 'injection_end', 'head_end', 'text', 'body_begin', 'injection_begin', 'injection_text', 'injection_end', 'body_text', 'injection_begin', 'injection_text', 'injection_end', 'body_end', 'text']);
      return _.pluck(tokens, 'content').join('').should.equal(html);
    });
    it(".parse", function() {
      var doc;
      doc = parser.parse(html);
      doc.content.should.equal(html);
      doc.head.should.be.an('object');
      doc.body.should.be.an('object');
      return doc.isComplete.should.be.true;
    });
    it(".parse - missing begin token", function() {
      return expect(function() {
        return parser.parse('</body>');
      }).to.throw(SyntaxError, "No matching 'body_begin'");
    });
    return it(".parse - missing end token", function() {
      return expect(function() {
        return parser.parse('<body>');
      }).to.throw(SyntaxError, "No matching 'body_end'");
    });
  });

}).call(this);

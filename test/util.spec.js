var callsite, camalize;

({camalize, callsite} = require('../src/util'));

describe("Util", function() {
  it(".camalize", function() {
    camalize('foo_bar').should.equal('fooBar');
    camalize('foo___bar').should.equal('fooBar');
    return camalize('_').should.equal('');
  });
  return it(".callsite", function() {
    var cs;
    cs = callsite();
    cs.should.be.an('array').of.length.above(0);
    // First stack trace should be this function
    cs[0].filePath.should.equal(__filename);
    return cs.forEach(function(s) {
      s.filePath.should.be.a('string').that.is.not.empty;
      s.file.should.be.an('object');
      s.line.should.be.a('number');
      return s.col.should.be.a('number');
    });
  });
});
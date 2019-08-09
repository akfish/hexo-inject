'use strict';
const {
  Node,
  Block,
  InjectionBlock,
  wrap
} = require('../src/parser/node');

describe('Node', () => {
  const foo = wrap('test', 'foo');
  const bar = wrap('test', 'bar');
  const baz = wrap('test', 'baz');
  it('Node::firstChild', () => {
    const n = new Node();
    n.append(foo);
    n.append(bar);
    return n.firstChild.should.equal(foo);
  });
  it('Node::firstChild - empty', () => {
    const n = new Node();
    return expect(n.firstChild).to.be.null;
  });
  it('Node::lastChild', () => {
    const n = new Node();
    n.append(foo);
    n.append(bar);
    return n.lastChild.should.equal(bar);
  });
  it('Node::lastChild - empty', () => {
    const n = new Node();
    return expect(n.lastChild).to.be.null;
  });
  it('Block::injectBefore', () => {
    const n = new Block();
    const i = new InjectionBlock();
    i.append(foo);
    n.append(i);
    n.append(foo);
    n.append(bar);
    n.injectBefore(baz);
    n.firstChild.type.should.equal('injection');
    n.firstChild.lastChild.should.deep.equal(wrap('injection_text', baz));
    return n.validate().should.be.true;
  });
  it('Block::injectBefore - no injection block', () => {
    const n = new Block();
    n.injectBefore(baz);
    n.firstChild.type.should.equal('injection');
    n.firstChild.lastChild.should.deep.equal(wrap('injection_text', baz));
    return n.validate().should.be.true;
  });
  it('Block::injectAfter', () => {
    const n = new Block();
    const i = new InjectionBlock();
    i.append(foo);
    n.append(foo);
    n.append(bar);
    n.append(i);
    n.injectAfter(baz);
    n.lastChild.type.should.equal('injection');
    n.lastChild.lastChild.should.deep.equal(wrap('injection_text', baz));
    return n.validate().should.be.true;
  });
  it('Block::injectAfter - no injection block', () => {
    const n = new Block();
    n.injectAfter(baz);
    n.lastChild.type.should.equal('injection');
    n.lastChild.firstChild.should.deep.equal(wrap('injection_text', baz));
    return n.validate().should.be.true;
  });
  it('InjectionBlock::injectBefore - ensure children uniqueness', () => {
    const i = new InjectionBlock();
    i.injectBefore(foo);
    i.injectBefore(bar);
    i.injectBefore(foo);
    i.injectBefore(baz);
    i.injectBefore(bar);
    return i.children.should.deep.equal([baz, bar, foo].map(wrap.bind(null, 'injection_text')));
  });
  return it('InjectionBlock::injectAfter - ensure children uniqueness', () => {
    const i = new InjectionBlock();
    i.injectAfter(foo);
    i.injectAfter(bar);
    i.injectAfter(foo);
    i.injectAfter(baz);
    i.injectAfter(bar);
    return i.children.should.deep.equal([foo, bar, baz].map(wrap.bind(null, 'injection_text')));
  });
});

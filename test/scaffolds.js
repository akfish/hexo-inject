global.Hexo = require('hexo');

// GLOBAL.fs = require('hexo-fs')
global.chai = require('chai');

global.expect = chai.expect;

global.should = chai.should;

should();

chai.use(require('chai-as-promised'));

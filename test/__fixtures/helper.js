function TestHelper() {
  this.delay = require('await-delay');
  this.path = require('path');
  this.expect = require('expect.js');
  this.package = require('../../package.json');
}

TestHelper.create = function(){

  return new TestHelper();
};

TestHelper.prototype.testName = function(testFilename, depth){
  if (!depth) depth = 2;
  var fileParts = testFilename.split(this.path.sep).reverse();
  var poParts = [];
  for (var i = 0; i < depth; i++)
    poParts.push(fileParts.shift());
  return poParts.reverse().join('/').replace('.js', '');
};

TestHelper.prototype.showOpenHandles = function(after, delayMS){
  const why = require('why-is-node-running');
  after('OPEN HANDLES:::', async () => {
    await this.delay(delayMS);
    why();
  });
};

module.exports = TestHelper;

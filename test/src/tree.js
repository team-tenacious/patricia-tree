const tests = require('../__fixtures/helper').create();
const Tree = require('../../src/tree');
describe(tests.testName(__filename, 3), function() {
  it('instantiate, insert and lookup', async () => {
    const radix = Tree.create();
    radix.insert('test/key/1', { value: 1 });
    radix.insert('test/key/2', { value: 2 });
    radix.insert('test/1/2', { value: 3 });
    tests.expect(radix.lookup('test/key/1')).to.eql([{ value: 1 }]);
    tests.expect(radix.lookup('test/key/2')).to.eql([{ value: 2 }]);
    tests.expect(radix.lookup('test/1/2')).to.eql([{ value: 3 }]);
    tests.expect(radix.lookup('test')).to.eql([{ value: 1 }, { value: 2 }, { value: 3 }]);
    tests.expect(radix.tree).to.eql({
        "test": {
          "/key": {
            "/1": {
              "$value": {
                "value": 1
              }
            },
            "/2": {
              "$value": {
                "value": 2
              }
            }
          },
          "/1/2": {
            "$value": {
              "value": 3
            }
          }
        }
      });
  });
});

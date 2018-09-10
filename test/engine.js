// helper to create tests for engines
const assert = require('assert');
const cuckoo = require('..');
const common = require('./common.js');

const api = {};
module.exports = api;

api.createTests = engine => {
  describe('solve', function() {
    // tests can take a long time to solve
    this.timeout(0);
    it('should solve gs=20 in="" test', async () => {
      const t = common.cloneTest('g20_1');
      const opts = {
        engine,
        graphSize: t.graphSize,
        input: t.input,
        nonce: t.solution.nonce,
        maxNonces: 1
      };
      const result = await cuckoo.solve(opts);
      assert.deepStrictEqual(result, t.solution);
    });
    it('should solve gs=30 in="" test', async () => {
      const t = common.cloneTest('g30_1');
      const opts = {
        engine,
        graphSize: t.graphSize,
        input: t.input,
        nonce: t.solution.nonce,
        maxNonces: 1
      };
      const result = await cuckoo.solve(opts);
      assert.deepStrictEqual(result, t.solution);
    });
    it.skip('should solve gs=20 in="test" test', async () => {
      const t = common.cloneTest(common.DEFAULT_TEST);
      const opts = {
        engine,
        graphSize: 20,
        input: Buffer.from('test'),
        nonce: 11
      };
      const result = await cuckoo.solve(opts);
      //assert.deepStrictEqual(result, t.solution);
      console.log('RESULT', result);
    });
  });
};

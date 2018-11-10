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
    it('should solve gs=20 sh=2-4 in="" test', async () => {
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
    it('should solve gs=20 sh=2-5 in="" test', async () => {
      const t = common.cloneTest('g20_sh25_1');
      const opts = {
        engine,
        graphSize: t.graphSize,
        input: t.input,
        sipHash: t.sipHash,
        nonce: t.solution.nonce,
        maxNonces: 1
      };
      const result = await cuckoo.solve(opts);
      assert.deepStrictEqual(result, t.solution);
    });
    // skipped due to resource and time usage
    it.skip('should solve gs=30 in="" test', async () => {
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
    it('should not solve gs=20 in="" difficult test', async () => {
      const t_d1x = common.cloneTest('g20_1');
      const t_d8x = common.cloneTest('g20_1_d8x');
      // check no solution with 1x difficulty nonce
      const opts = {
        engine,
        graphSize: t_d8x.graphSize,
        input: t_d8x.input,
        // checking 1x nonce
        nonce: t_d1x.solution.nonce,
        maxNonces: 1,
        difficulty: t_d8x.difficulty
      };
      const s = await cuckoo.solve(opts);
      assert(s === null);
      // check solution with 8x difficulty nonce
      const opts2 = {
        engine,
        graphSize: t_d8x.graphSize,
        input: t_d8x.input,
        nonce: t_d8x.solution.nonce,
        maxNonces: 1,
        difficulty: t_d8x.difficulty
      };
      const result = await cuckoo.solve(opts2);
      assert.deepStrictEqual(result, t_d8x.solution);
    });
    it('should solve chain gs=20 in="" cl=2 test', async () => {
      const t = common.cloneTest('g20_1_c2');
      const opts = {
        engine,
        graphSize: t.graphSize,
        input: t.input,
        nonces: t.solution.map(s => s.nonce),
        maxNonces: 1,
        maxChainNonces: t.chainLength,
        chainLength: t.chainLength
      };
      const result = await cuckoo.solveChain(opts);
      assert.deepStrictEqual(result, t.solution);
    });
    it('should not solve chain gs=20 in="" cl=2 test', async () => {
      const t = common.cloneTest('g20_1_c2');
      const opts = {
        engine,
        graphSize: t.graphSize,
        input: t.input,
        nonces: t.solution.map(s => s.nonce),
        maxNonces: 1,
        // force not enough nonces
        maxChainNonces: t.chainLength - 1,
        chainLength: t.chainLength
      };
      let err;
      try {
        await cuckoo.solveChain(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
  });
};

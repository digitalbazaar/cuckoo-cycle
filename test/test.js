const assert = require('assert');
const common = require('./common.js');
const cuckoo = require('..');

describe('cuckoo', function() {
  describe('solve', function() {
    it('should fail for no engine', async () => {
      const opts = {
        input: Buffer.allocUnsafe(0)
      };
      let err;
      try {
        await cuckoo.solve(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for large input buffer', async () => {
      const opts = {
        engine: 'test',
        input: Buffer.alloc(33)
      };
      let err;
      try {
        await cuckoo.solve(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for negative nonce', async () => {
      const opts = {
        engine: 'test',
        input: Buffer.alloc(33),
        nonce: -1
      };
      let err;
      try {
        await cuckoo.solve(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for large nonce', async () => {
      const opts = {
        engine: 'test',
        input: Buffer.alloc(33),
        nonce: 0x100000000
      };
      let err;
      try {
        await cuckoo.solve(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for links < 1', async () => {
      const opts = {
        engine: 'test',
        input: Buffer.alloc(33),
        links: 0
      };
      let err;
      try {
        await cuckoo.solve(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    // NOTE: solver tests in engine packages
  });

  describe('verify', function() {
    it('should fail for large input buffer', async () => {
      const opts = common.cloneTest(common.DEFAULT_TEST);
      opts.input = Buffer.alloc(33);
      let err;
      try {
        await cuckoo.verify(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for missing nonce', async () => {
      const opts = common.cloneTest(common.DEFAULT_TEST);
      delete opts.solution.nonce;
      let err;
      try {
        await cuckoo.verify(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for non-int nonce', async () => {
      const opts = common.cloneTest(common.DEFAULT_TEST);
      opts.solution.nonce = 'imanonce';
      let err;
      try {
        await cuckoo.verify(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for negative nonce', async () => {
      const opts = common.cloneTest(common.DEFAULT_TEST);
      opts.solution.nonce = -1;
      let err;
      try {
        await cuckoo.verify(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should fail for large nonce', async () => {
      const opts = common.cloneTest(common.DEFAULT_TEST);
      opts.solution.nonce = 0x100000000;
      let err;
      try {
        await cuckoo.verify(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should verify graphSize=20 solution', async () => {
      const opts = common.cloneTest('g20_1');
      return cuckoo.verify(opts);
    });
    it('should verify graphSize=30 solution', async () => {
      const opts = common.cloneTest('g30_1');
      return cuckoo.verify(opts);
    });
    it('should verify graphSize=20 links=2 solution', async () => {
      const opts = common.cloneTest('g20_1_c2');
      return cuckoo.verifyChain(opts);
    });
  });
});

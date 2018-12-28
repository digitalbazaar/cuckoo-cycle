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
    it('should fail for chain length < 1', async () => {
      const opts = {
        engine: 'test',
        input: Buffer.alloc(33),
        chainLength: 0
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

    // cuckoo variant
    it('should verify cuckoo_g20_sh24 solution', async () => {
      const opts = common.cloneTest('cuckoo_g20_sh24_1');
      return cuckoo.verify(opts);
    });
    it('should verify cuckoo_g20_sh25 solution', async () => {
      const opts = common.cloneTest('cuckoo_g20_sh25_1');
      return cuckoo.verify(opts);
    });
    it('should verify cuckoo_g30_sh24 solution', async () => {
      const opts = common.cloneTest('cuckoo_g30_sh24_1');
      return cuckoo.verify(opts);
    });
    it('should verify cuckoo_g20_cl2 solution', async () => {
      const opts = common.cloneTest('cuckoo_g20_sh24_1_c2');
      return cuckoo.verifyChain(opts);
    });

    // cuckatoo variant
    it('should verify cuckatoo_g20_sh24 solution', async () => {
      const opts = common.cloneTest('cuckatoo_g20_sh24_1');
      return cuckoo.verify(opts);
    });
    it('should verify cuckatoo_g20_sh25 solution', async () => {
      const opts = common.cloneTest('cuckatoo_g20_sh25_1');
      return cuckoo.verify(opts);
    });
    it('should verify cuckatoo_g30_sh24 solution', async () => {
      const opts = common.cloneTest('cuckatoo_g30_sh24_1');
      return cuckoo.verify(opts);
    });
    it('should verify cuckatoo_g20_sh24_cl2 solution', async () => {
      const opts = common.cloneTest('cuckatoo_g20_sh24_1_c2');
      return cuckoo.verifyChain(opts);
    });
  });
});

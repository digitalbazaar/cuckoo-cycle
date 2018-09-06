const assert = require('assert');
const cuckoo = require('..');
const Long = require('long');

function str2edges(str) {
  return str.split(' ').map(x => Long.fromString(x, true, 16).low);
}

const tests = {
  t20_1: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 38,
      edges: str2edges('21ce 5240 d304 d34c f756 faf5 16c9f 1a349 1d3d9 2096a 22036 2589b 2e2ed 2eb40 2fb3c 376fd 37740 393c0 3ad29 3cf04 3f365 41fe2 43a29 454eb 4cf13 4d12c 535ed 57d03 60e81 68fd1 6902f 69408 6c2f1 728c8 73e0e 76589 7a037 7adcb 7c4b8 7d746 7eae0 7fe67')
    }
  }
};
const DEFAULT_TEST = 't20_1';

function cloneTest(id) {
  const t = tests[id];
  return {
    graphSize: 20,
    input: Buffer.from(t.input),
    solution: {
      nonce: t.solution.nonce,
      edges: Array.from(t.solution.edges)
    }
  };
}

describe('cuckoo', function() {
  describe('verify', function() {
    it('should fail for large input buffer', async () => {
      const opts = cloneTest(DEFAULT_TEST);
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
      const opts = cloneTest(DEFAULT_TEST);
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
      const opts = cloneTest(DEFAULT_TEST);
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
      const opts = cloneTest(DEFAULT_TEST);
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
      const opts = cloneTest(DEFAULT_TEST);
      opts.solution.nonce = 0x100000000;
      let err;
      try {
        await cuckoo.verify(opts);
      } catch(e) {
        err = e;
      }
      assert(err);
    });
    it('should verify known solution', async () => {
      const opts = cloneTest(DEFAULT_TEST);
      return cuckoo.verify(opts);
    });
  });
});

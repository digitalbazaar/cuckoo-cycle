const Long = require('long');

const api = {};
module.exports = api;

function str2edges(str) {
  return str.split(' ').map(x => Long.fromString(x, true, 16).low);
}

api.tests = {
  g20_1: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 38,
      edges: str2edges('21ce 5240 d304 d34c f756 faf5 16c9f 1a349 1d3d9 2096a 22036 2589b 2e2ed 2eb40 2fb3c 376fd 37740 393c0 3ad29 3cf04 3f365 41fe2 43a29 454eb 4cf13 4d12c 535ed 57d03 60e81 68fd1 6902f 69408 6c2f1 728c8 73e0e 76589 7a037 7adcb 7c4b8 7d746 7eae0 7fe67')
    }
  },
  // from: https://github.com/tromp/cuckoo/blob/master/GPU.md
  g30_1: {
    graphSize: 30,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 63,
      edges: str2edges('23ece 27e0856 2ad8c27 2cbb0b5 3694cdd 477a095 64de6fc 64e1c92 68e624d 6aa4c6f 6b1d0c2 76f07d2 c273122 c2e38ed c655cde c97ba17 e708130 ec8890d ecb9932 f28d66d f577aff 104d8441 116de91f 116e61cb 1178ea28 11840f8a 11ce10b0 12792630 12ae2388 140ae893 1439b9fd 146a3047 1538d93c 176cb068 17e01c9b 1876ee0a 1c871774 1d37d976 1d6fa785 1d9c1669 1d9d015e 1db85f7e')
    }
  }
};

api.DEFAULT_TEST = 'g20_1';

api.cloneTest = id => {
  const t = api.tests[id];
  return {
    graphSize: t.graphSize,
    input: Buffer.from(t.input),
    solution: {
      nonce: t.solution.nonce,
      edges: Array.from(t.solution.edges)
    }
  };
};

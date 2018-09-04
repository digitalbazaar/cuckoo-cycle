const cuckoo = require('./index');
const Long = require('long');

const input = Buffer.allocUnsafe(0);
const edges = '21ce 5240 d304 d34c f756 faf5 16c9f 1a349 1d3d9 2096a 22036 2589b 2e2ed 2eb40 2fb3c 376fd 37740 393c0 3ad29 3cf04 3f365 41fe2 43a29 454eb 4cf13 4d12c 535ed 57d03 60e81 68fd1 6902f 69408 6c2f1 728c8 73e0e 76589 7a037 7adcb 7c4b8 7d746 7eae0 7fe67'
  .split(' ')
  .map(x => Long.fromString(x, true, 16).low)

const solution = {
  nonce: 38,
  edges
};

console.log('solution', solution);

(async () => {
  const start = Date.now();
  const count = 10000;
  for(let i = 0; i < count; ++i) {
    try {
      await cuckoo.verify({input, solution, graphSize: 20});
    } catch(e) {
      console.error(e);
      throw e;
    }
  }
  const end = Date.now();
  console.log('total', (end - start) / count);
})();

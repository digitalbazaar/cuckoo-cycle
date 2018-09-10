const Benchmark = require('benchmark');
const common = require('../test/common.js');
const cuckoo = require('..');

const api = {};
module.exports = api;

api.test = engine => {
  const t = common.cloneTest(common.DEFAULT_TEST);
  const suite = new Benchmark.Suite();
  suite
    .add({
      name: 'solve',
      defer: true,
      fn: deferred => {
        const opts = {
          engine,
          graphSize: t.graphSize,
          input: t.input,
          nonce: t.solution.nonce,
          maxNonces: 1
          //nonce: 0,
          //maxNonces: 40
        };
        cuckoo.solve(opts).then((r) => {
          deferred.resolve();
        });
      }
    })
    .on('cycle', e => {
      console.log(String(e.target));
    })
    //.on('complete', e => {})
    .run({async: true});
}

const Benchmark = require('benchmark');
const cuckoo = require('..');
const tests = require('../test/common.js');

const api = {};
module.exports = api;

api.run = (/*engine*/) => {
  const suite = new Benchmark.Suite();
  const t24 = tests.cloneTest('g20_1');
  const t25 = tests.cloneTest('g20_sh25_1');
  suite
    .add({
      name: 'verify g=20 sh=2-4',
      defer: true,
      fn: deferred => {
        cuckoo.verify(t24).then(() => {
          deferred.resolve();
        });
      }
    })
    .add({
      name: 'verify g=20 sh=2-5',
      defer: true,
      fn: deferred => {
        cuckoo.verify(t25).then(() => {
          deferred.resolve();
        });
      }
    })
    .on('cycle', e => {
      console.log(String(e.target));
    })
    //.on('complete', e => {})
    .run({async: true});
};

/**
 * Cuckoo Cycle for Node.js.
 * nonces test.
 *
 * Copyright (c) 2018 Digital Bazaar, Inc.
 *
 * MIT License
 * <https://github.com/digitalbazaar/cuckoo-cycle/blob/master/LICENSE>
 */
const common = require('../test/common.js');
const cuckoo = require('..');
const fs = require('fs');
const path = require('path');

const api = {};
module.exports = api;

function progress({results, info, last=false}) {
  if(process.env.DATADIR) {
    if(last || (results.length % 10 === 0)) {
      savedata(...arguments);
    }
  }
}
const filePrefix = (new Date).toISOString().replace(/[^0-9]/g,'');
const uniqf = new Map();
function savedata({results, info, last=false}) {
  const idxname =
    `${filePrefix}-${info.engine}-g${info.graphSize}-e${info.edgeCount}` +
    `-${info.tag}`;
  const cur = uniqf.get(idxname) || 0;
  const next = cur + 1;
  uniqf.set(idxname, next);
  const lasttag = last ? '-last' : '-tmp';
  const filename =
    path.join(process.env.DATADIR, `${idxname}-${next}${lasttag}.csv`);
  if(fs.existsSync(filename)) {
    throw new Error('Conflicting data filename: ' + filename);
  }
  const data = results.map(s => `${s.i},${s.nonces},${s.time}`);
  fs.writeFileSync(filename, data.join('\n') + '\n');
  console.log('Wrote results:', filename);
}

api.findNonces = async ({engine, graphSize, edgeCount, count, difficulty, tag=''}) => {
  // 32b input buffer
  const input = Buffer.alloc(4, 0);
  const results = [];
  console.log(`FIND engine:${JSON.stringify(engine)} graphSize:${graphSize} edgeCount:${edgeCount} count:${count} tag:${tag} filePrefix:${filePrefix}`);
  const info = {
    engine: engine.name || engine,
    graphSize,
    edgeCount,
    tag
  };
  for(let i = 0; i < count; ++i) {
    console.log(`= TEST i:${i} gs:${graphSize} ec:${edgeCount}`);
    // update input
    const u32 = new Uint32Array(
      input.buffer, input.bufferOffset, input.bufferLength);
    u32[0] = i;
    const opts = {
      engine,
      graphSize,
      edgeCount,
      input,
      maxNonces: 1000
    };
    if(difficulty) {
      opts.difficulty = difficulty;
    }
    const start = process.hrtime();
    const result = await cuckoo.solve(opts);
    const diff = process.hrtime(start);
    const dt = diff[0] + diff[1] / 1e9;
    const nonce = result ? result.nonce : -1;
    results.push({
      i,
      nonces: nonce,
      time: dt
    });
    if(result) {
      console.log(`FOUND i:${i} nonce:${result.nonce} dt:${dt}`);
    } else {
      console.log(`NOT FOUND i:${i} dt:${dt}`);
      // FIXME
    }
    progress({results, info, last: false})
  }
  progress({results, info, last: true})
};

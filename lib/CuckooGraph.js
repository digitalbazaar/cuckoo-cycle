/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const helpers = require('./helpers');
const Long = require('long');

// Note: default SipHash keys are XOR'd with these constants
const KEY_CONSTANTS = [
  Long.fromString('736f6d6570736575', true, 16),
  Long.fromString('646f72616e646f6d', true, 16),
  Long.fromString('6c7967656e657261', true, 16),
  Long.fromString('7465646279746573', true, 16)
];

module.exports = class CuckooGraph {
  constructor({
    input, nonce, edgeBits, useSipHashDefaults = false, sipHash = 'sipHash24'
  }) {
    const headerKey = helpers.createHeaderKey({input, nonce});

    this.v = [];

    const unsigned = true;
    // siphash "keys" are in little endian order
    if(useSipHashDefaults) {
      // default keys use only 128-bit input (first two "keys" from header)
      const k0 = Long.fromBytesLE(headerKey.slice(0, 8), unsigned);
      const k1 = Long.fromBytesLE(headerKey.slice(8, 16), unsigned);
      this.v[0] = k0.xor(KEY_CONSTANTS[0]);
      this.v[1] = k1.xor(KEY_CONSTANTS[1]);
      this.v[2] = k0.xor(KEY_CONSTANTS[2]);
      this.v[3] = k1.xor(KEY_CONSTANTS[3]);
    } else {
      // set keys to whatever is in `headerKey`
      this.v[0] = Long.fromBytesLE(headerKey.slice(0, 8), unsigned);
      this.v[1] = Long.fromBytesLE(headerKey.slice(8, 16), unsigned);
      this.v[2] = Long.fromBytesLE(headerKey.slice(16, 24), unsigned);
      this.v[3] = Long.fromBytesLE(headerKey.slice(24), unsigned);
    }

    // compute mask for hash output
    const numberOfEdges = Long.ONE.shl(edgeBits);
    this.EDGE_MASK = numberOfEdges.getLowBitsUnsigned() - 1;

    let sipHashFn = this['_' + sipHash];
    if(!sipHashFn) {
      throw new Error(`Unsupported SipHash ${sipHash}.`);
    }
    sipHashFn = sipHashFn.bind(this);

    // create `getNode` to generate a node (edge endpoint) in the graph w/o
    // the partition bit based on siphash iterations
    this.getNode = (edge, uorv) =>
      sipHashFn(2 * edge + uorv).and(this.EDGE_MASK);
  }

  // runs SipHash-c-d (c = 2, d = 4) using `this.v` and the given 32-bit edge
  // SipHash-2-4 means 2 SipRounds during "compression" and then 4
  // SipRounds during "finalization"
  _sipHash24(edge) {
    // TODO: could potentially speed this up w/o Long library in the future
    // ... or, in the interim, use rotl/rotr functions once provided
    let v0 = _clone(this.v[0]);
    let v1 = _clone(this.v[1]);
    let v2 = _clone(this.v[2]);
    let v3 = _clone(this.v[3].xor(edge));

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    v0 = v0.xor(edge);
    v2 = v2.xor(0xFF);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    return v0.xor(v1).xor(v2).xor(v3);
  }

  // runs SipHash-c-d (c = 2, d = 5) using `this.v` and the given 32-bit edge
  // SipHash-2-5 means 2 SipRounds during "compression" and then 5
  // SipRounds during "finalization"
  _sipHash25(edge) {
    // TODO: could potentially speed this up w/o Long library in the future
    // ... or, in the interim, use rotl/rotr functions once provided
    let v0 = _clone(this.v[0]);
    let v1 = _clone(this.v[1]);
    let v2 = _clone(this.v[2]);
    let v3 = _clone(this.v[3].xor(edge));

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    v0 = v0.xor(edge);
    v2 = v2.xor(0xFF);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    // SipRound
    v0 = v0.add(v1);
    v2 = v2.add(v3);
    v1 = v1.shl(13).or(v1.shru(51));
    v3 = v3.shl(16).or(v3.shru(48));
    v1 = v1.xor(v0);
    v3 = v3.xor(v2);
    v0 = _swap(v0);
    v2 = v2.add(v1);
    v0 = v0.add(v3);
    v1 = v1.shl(17).or(v1.shru(47));
    v3 = v3.shl(21).or(v3.shru(43));
    v1 = v1.xor(v2);
    v3 = v3.xor(v0);
    v2 = _swap(v2);

    return v0.xor(v1).xor(v2).xor(v3);
  }
};

function _clone(long) {
  return new Long(long.low, long.high, long.unsigned);
}

function _swap(long) {
  return new Long(long.high, long.low, long.unsigned);
}

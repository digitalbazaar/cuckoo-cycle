/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const constants = require('./constants');
const sodium = require('sodium-universal');

const api = {};
module.exports = api;

// sanity check
if(constants.HASH_SIZE < sodium.crypto_generichash_BYTES_MIN ||
  constants.HASH_SIZE > sodium.crypto_generichash_BYTES_MAX) {
  throw new RangeError('Hash size not valid.');
}

api.createHeaderKey = ({input, nonce}) => {
  const header = createHeader({input, nonce});

  // TODO: support SHA-256 via param?

  // hash header and produce "keys" (initial value) for SipHash-2-4
  // use `blake2b` with 32 bytes of output
  const output = Buffer.allocUnsafe(constants.HASH_SIZE);
  sodium.crypto_generichash(output, header);
  return output;
};

function createHeader({input, nonce}) {
  // append nonce onto input to create `header` to hash
  const header = Buffer.allocUnsafe(constants.HEADER_SIZE).fill(0);
  input.copy(header, 0);
  header.writeUInt32LE(nonce, constants.HEADER_SIZE - constants.NONCE_SIZE);
  return header;
}

/**
 * Check if input difficulty is above a set value.
 *
 * @param edges an array of unsigned 32 bit integers representing the edges
 *          list.
 * @param difficulty a 32 byte Node.js Buffer representing a target difficulty
 *          (0 < T < 2^256) that the blake2b hash of the sorted edgelist
 *          (ascending and serialized little endian) must be less than.
 *
 * @return true if meets difficuly threshold, else false.
 */
api.checkDifficulty = ({edges, difficulty}) => {
  // TODO: check if sorted edges can be a pre-condition at a higher level
  const sortedEdges = Array.from(edges).sort();
  const edgesBuf = Buffer.allocUnsafe(sortedEdges.length * 4);
  for(let i = 0; i < sortedEdges.length; ++i) {
    edgesBuf.writeUInt32LE(sortedEdges[i], i * 4);
  }
  const edgesHash = Buffer.allocUnsafe(constants.HASH_SIZE);
  sodium.crypto_generichash(edgesHash, edgesBuf);
  return Buffer.compare(edgesHash, difficulty) === -1;
};

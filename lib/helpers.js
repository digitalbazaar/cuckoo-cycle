/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chloride = require('chloride');
const constants = require('./constants');

const api = {};
module.exports = api;

api.createHeaderKey = ({input, nonce}) => {
  const header = createHeader({input, nonce});

  // TODO: support SHA-256 via param?

  // hash header and produce "keys" (initial value) for SipHash-2-4
  // use `blake2b` with 32 bytes of output
  return chloride.crypto_generichash(header, constants.HASH_SIZE);
};

function createHeader({input, nonce}) {
  // append nonce onto input to create `header` to hash
  const header = Buffer.allocUnsafe(constants.HEADER_SIZE).fill(0);
  input.copy(header, 0);
  header.writeInt32LE(nonce, constants.HEADER_SIZE - constants.NONCE_SIZE);
  return header;
}

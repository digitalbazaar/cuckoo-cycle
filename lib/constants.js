/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const api = {};
module.exports = api;

// sizes are in bytes
api.DIFFICULTY_SIZE = 32;
api.HASH_SIZE = 32;
api.HEADER_SIZE = 80;
api.INPUT_SIZE = 32;
api.NONCE_SIZE = 4;

// 2^DEFAULT_GRAPH_SIZE nodes in a graph
api.DEFAULT_GRAPH_SIZE = 32;
api.DEFAULT_EDGE_COUNT = 42;
api.DEFAULT_DIFFICULTY = Buffer.allocUnsafe(api.DIFFICULTY_SIZE).fill(0xFF);

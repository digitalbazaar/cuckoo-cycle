/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const constants = require('./constants');
const engines = require('./engines');

const api = {};
module.exports = api;

/**
 * Attempts to solve the Cuckoo Cycle Proof-of-Work for the given parameters.
 *
 * TODO: Support Uint8Arrays for use in browser?
 *
 * @param engine the name of the engine to use.
 * @param input a node.js Buffer 32-byte buffer of data that the solution is
 *          based on, usually the output if a hash function, like SHA-256, on
 *          some data that the proof is bound to.
 * @param edgeCount the expected number of edges in the solution.
 * @param difficulty a 32 byte node.js Buffer representing a target difficulty
 *          (0 < T < 2^256) that the blake2b hash of the sorted edgelist
 *          (ascending and serialized little endian) must be less than.
 *
 * @return a Promise that resolves to a solution (an object) with:
 *          nonce the nonce as an integer.
 *          edges an array of integers representing the edge list.
 */
api.solve = async ({
  engine,
  input,
  // graph size is measured by `N` where graph is 2^N nodes
  graphSize = constants.DEFAULT_GRAPH_SIZE,
  edgeCount = constants.DEFAULT_EDGE_COUNT,
  difficulty = constants.DEFAULT_DIFFICULTY
}) => {
  if(!(engine && typeof engine === 'string')) {
    throw new Error(
      `"engine" must be a string identifying a preregistered engine to use.`);
  }
  if(!(input instanceof Buffer && input.byteLength <= constants.INPUT_SIZE)) {
    throw new Error(
      `"input" must be ${constants.INPUT_SIZE} or fewer bytes in length.`);
  }
  if(!(difficulty instanceof Buffer &&
    difficulty.byteLength === constants.DIFFICULTY_SIZE)) {
    throw new TypeError(
      `"difficulty" must be ${constants.DIFFICULTY_SIZE} bytes in length.`);
  }

  // TODO: iterate `engine.solve` until `difficulty` passes

  // get engine API via its name
  engine = engines.use(engine);
  return engine.solve({input, graphSize, edgeCount});
};

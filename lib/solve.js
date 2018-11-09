/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {checkDifficulty} = require('./helpers');
const constants = require('./constants');
const crypto = require('crypto');
const engines = require('./engines');

const api = {};
module.exports = api;

/**
 * Attempts to solve the Cuckoo Cycle Proof-of-Work for the given parameters.
 *
 * TODO: Support Uint8Arrays for use in browser?
 *
 * @param engine the name of the engine to use, or an object with a name
 *          property of the engine and other custom engine options.
 * @param input a Node.js Buffer of up to 32 bytes that the solution is
 *          based on, usually the output of a hash function, like SHA-256, on
 *          some data that the proof is bound to.
 * @param [graphSize] the size of the graph.
 * @param [edgeCount] the expected number of edges in the solution.
 * @param [sipHash] SipHash-C-D type, 2-4 or 2-5 (default: 'SipHash-2-4')
 * @param [difficulty] a 32 byte Node.js Buffer representing a target difficulty
 *          (0 < T < 2^256) that the blake2b hash of the sorted edgelist
 *          (ascending and serialized little endian) must be less than.
 * @param [nonce] 32 bit unsigned integer nonce to start at.
 * @param [maxNonces] maximum number of nonces to check.
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
  sipHash = constants.DEFAULT_SIPHASH,
  difficulty = constants.DEFAULT_DIFFICULTY,
  nonce = 0,
  maxNonces = 0xFFFFFFFF
}) => {
  if(!(engine && typeof engine === 'string')) {
    if(!(engine && typeof engine === 'object' &&
      typeof engine.name === 'string')) {
      throw new Error(
        `"engine" must be a string identifying a preregistered engine to use
        or an object with a "name" property.`);
    }
  }
  if(!(input instanceof Buffer && input.byteLength <= constants.INPUT_SIZE)) {
    throw new Error(
      `"input" must be ${constants.INPUT_SIZE} or fewer bytes in length.`);
  }
  if(!(Number.isInteger(nonce) &&
    nonce >= 0 && nonce <= 0xFFFFFFFF)) {
    throw new TypeError('"nonce" must be a 32-bit unsigned integer.');
  }
  if(!(Number.isInteger(maxNonces) &&
    maxNonces >= 0 && maxNonces <= 0xFFFFFFFF)) {
    throw new TypeError('"maxNonces" must be a 32-bit unsigned integer.');
  }
  if(!(difficulty instanceof Buffer &&
    difficulty.byteLength === constants.DIFFICULTY_SIZE)) {
    throw new TypeError(
      `"difficulty" must be ${constants.DIFFICULTY_SIZE} bytes in length.`);
  }

  const _engineOpts = typeof engine === 'string' ? {name: engine} : engine;

  // get engine API via its name
  const _engine = engines.use(_engineOpts.name);
  // iterate `engine.solve` until `difficulty` passes, or max nonces hit
  let noncesRemaining = maxNonces;
  while(noncesRemaining > 0) {
    //console.log('SOLCHECK', currentNonce, noncesRemaining, maxNonces,
    //  {graphSize, edgeCount, nonce, noncesRemaining});
    const result = await _engine.solve({
      engine: _engineOpts, input, graphSize, edgeCount, sipHash, nonce,
      maxNonces: noncesRemaining
    });
    //console.log('SOL', result);
    /*
    console.log('SOL', {
      nonces: result.solutions.map(s => s.nonce),
      time: result.time
    });
    */
    if(result.solutions.length === 0) {
      break;
    }
    for(const solution of result.solutions) {
      //console.log('SOLDIFF', solution.nonce,
      //  checkDifficulty({edges: solution.edges, difficulty}));
      if(checkDifficulty({edges: solution.edges, difficulty})) {
        return solution;
      }
    }
    const nextNonce = Math.max(...result.solutions.map(s => s.nonce)) + 1;
    noncesRemaining -= (nextNonce - nonce);
    nonce = nextNonce;
  }
  // no more nonces to check: solution not found
  return null;
};

/**
 * Attempts to solve the Cuckoo Cycle Proof-of-Work for the given parameters.
 * This variation chains Cuckoo proofs together.
 *
 * TODO: Support Uint8Arrays for use in browser?
 *
 * @param engine the name of the engine to use, or an object with a name
 *          property of the engine and other custom engine options.
 * @param input a Node.js Buffer of up to 32 bytes that the solution is
 *          based on, usually the output of a hash function, like SHA-256, on
 *          some data that the proof is bound to.
 * @param [graphSize] the size of the graph.
 * @param [edgeCount] the expected number of edges in the solution.
 * @param [difficulty] a 32 byte Node.js Buffer representing a target difficulty
 *          (0 < T < 2^256) that the blake2b hash of the sorted edgelist
 *          (ascending and serialized little endian) must be less than.
 * @param [maxNonces] maximum number of nonces to check for all links.
 * @param [links] number of chain links to create.
 *
 * @return a Promise that resolves to an array of object solutions with:
 *          nonce the nonce as an integer.
 *          edges an array of integers representing the edge list.
 */
api.solveChain = async ({
  engine,
  input,
  // graph size is measured by `N` where graph is 2^N nodes
  graphSize = constants.DEFAULT_GRAPH_SIZE,
  edgeCount = constants.DEFAULT_EDGE_COUNT,
  difficulty = constants.DEFAULT_DIFFICULTY,
  maxNonces = 0xFFFFFFFF,
  links = 1
}) => {
  if(!(Number.isInteger(links) && links >= 1)) {
    throw new TypeError('"links" must be an integer > 1.');
  }
  const solution = [];
  let nextInput = input;
  for(let i = 0; i < links; ++i) {
    const s = await api.solve({
      engine, input: nextInput, graphSize, edgeCount, difficulty, nonce: 0,
      maxNonces
    });
    if(s === null) {
      throw new Error('Chained solution not found.');
    }
    solution.push(s);
    // build next input buffer from previous solution
    // FIXME: document format
    const hash = crypto.createHash('sha256');
    hash.update(Int32Array.from(s.nonce));
    hash.update(Int32Array.from(s.edges));
    nextInput = hash.digest();
  }
  return solution;
};

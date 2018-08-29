/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chloride = require('chloride');
const CuckooGraph = require('./CuckooGraph');
const Long = require('long');

// sizes are in bytes
const DIFFICULTY_SIZE = 32;
const HASH_SIZE = 32;
const HEADER_SIZE = 80;
const INPUT_SIZE = 32;
const NONCE_SIZE = 4;

const DEFAULT_N = 32;
const DEFAULT_EDGE_COUNT = 42;
const DEFAULT_DIFFICULTY = Buffer.allocUnsafe(DIFFICULTY_SIZE).fill(0xFF);

const api = {};
module.exports = api;

/**
 * Attempts to verify the given Cuckoo Cycle solution.
 *
 * TODO: Support Uint8Arrays for use in browser?
 *
 * @param input a node.js Buffer 32-byte buffer of data that the solution is
 *          based on, usually the output if a hash function, like SHA-256, on
 *          some data that the proof is bound to.
 * @param solution the potential solution:
 *          nonce the nonce as an integer.
 *          edges an array of integers representing the edge list.
 * @param edgeCount the expected number of edges in the solution.
 * @param difficulty a 32 byte node.js Buffer representing a target difficulty
 *          (0 < T < 2^256) that the blake2b hash of the sorted edgelist
 *          (ascending and serialized little endian) must be less than.
 *
 * @return a Promise that resolves to `true` if the solution was verified
 *         and `false` if not.
 */
api.verify = async ({
  input, solution,
  // graph size is 2^N nodes
  N = DEFAULT_N,
  edgeCount = DEFAULT_EDGE_COUNT,
  difficulty = DEFAULT_DIFFICULTY
}) => {
  if(!(input instanceof Buffer && input.byteLength <= INPUT_SIZE)) {
    throw new Error(`"input" must be ${INPUT_SIZE} or fewer bytes in length.`);
  }
  if(!(solution && typeof solution === 'object')) {
    throw new TypeError('"solution" must be an object.');
  }
  if(!(Number.isInteger(solution.nonce) && solution.nonce <= 0xFFFFFFFF)) {
    throw new TypeError('"solution.nonce" must be a 32-bit integer.');
  }
  if(!(Array.isArray(solution.edges) &&
    solution.edges.length === edgeCount &&
    solution.edges.every(Number.isInteger))) {
    throw new TypeError(
      `"solution.edges" must be an array with ${edgeCount} integers.`);
  }
  if(!(difficulty instanceof Buffer &&
    difficulty.byteLength === DIFFICULTY_SIZE)) {
    throw new TypeError(
      `"difficulty" must be ${DIFFICULTY_SIZE} bytes in length.`);
  }

  // append nonce onto input to create `header` to hash
  const header = Buffer.allocUnsafe(HEADER_SIZE).fill(0);
  input.copy(header, 0);
  header.writeInt32LE(solution.nonce, HEADER_SIZE - NONCE_SIZE);

  // TODO: support SHA-256 via param?

  // hash header and produce "keys" (initial value) for SipHash-2-4
  // use `blake2b` with 32 bytes of output
  const headerKey = chloride.crypto_generichash(header, HASH_SIZE);

  // create cuckoo graph (really just a graph node generator)
  const graph = new CuckooGraph({headerKey, edgeBits: N - 1});

  /* Note: We are given a set of edges that are encoded such that:

  `Hash(2 * edge + 0)` will yield one of the nodes the edge connects to, and
  `Hash(2 * edge + 1)` will yield the other.

  Calling `graph.getNode(edge, zero_or_one)` produces a node from an edge.

  We process the edges into two arrays of nodes `U` and `V` to represent the
  bipartite graph. Edges must be given in ascending order. Nodes that share
  the same index between the two arrays are connected to one another. Nodes
  with more than one edge appear multiple times in an array. A valid solution
  will include a cycle of a specified length where each node has exactly one
  incoming edge and one outgoing edge.

  We should therefore expect nodes to appear exactly twice within their own
  arrays and not at all in the other array (once for an incoming edge and
  once for an outgoing edge). Furthermore, we should be able to start at a
  node in one array, find its unique duplicate in the same array, and then
  use the duplicate's index position in the other array to find the node it
  is connected to. This process can be recursively followed, keeping a counter
  for the number of times it has occurred, until the original node is found
  again. If the node is found again and the number of times it has occurred
  matches the required cycle length, then the solution is verified. */

  // in this loop we verify that the edges are ascending, build the arrays of
  // nodes `U` and `V` and verify that XORing the contents of each array
  // yields `0` (a quick trivial check that they at least have node values
  // that cancel each other out... we require pairs of duplicates)
  const uNodes = [];
  const vNodes = [];
  const {edges} = solution;
  let xorU = Long.ZERO;
  let xorV = Long.ZERO;
  for(let i = 0; i < edges.length; ++i) {
    const edge = edges[i];
    // TODO: just return `false` instead?
    if(edge > graph.EDGE_MASK) {
      throw new Error(`Edge ${i} is too big.`);
    }
    if(i && edge <= edges[i - 1]) {
      return new Error(`Edge ${i} is too small.`);
    }
    xorU = xorU.xor(uNodes[i] = graph.getNode(edge, 0));
    xorV = xorV.xor(vNodes[i] = graph.getNode(edge, 1));
  }

  if(!xorU.or(xorV).isZero()) {
    throw new Error('Nodes do not have incoming/outgoing pairs.');
  }

  // verify the cycle
  let cycleLength = 0;
  let current = 0;
  let nodeSet = uNodes;
  do {
    let match = null;
    for(let i = 0; i < edgeCount; ++i) {
      // skip over current node, looking for its match
      if(i === current) {
        continue;
      }
      // found the same node (matching incoming/outgoing edges)
      if(nodeSet[i].compare(nodeSet[current]) === 0) {
        if(match !== null) {
          // a match has been found before so the node has more edges than the
          // incoming/outgoing pair, i.e. the cycle branches
          throw new Error(`Branch in cycle at node ${match}.`);
        }
        // matching node found, but keep cycling to ensure it's unique
        match = i;
      }
    }
    if(match === null) {
      // no match found
      throw new Error(
        `Node at ${current} has no matching incoming/outgoing edge.`);
    }
    cycleLength++;
    // move to the node connected to the match from the other set to follow
    // the cycle around
    current = match;
    nodeSet = nodeSet === uNodes ? vNodes : uNodes;
  } while(current !== 0);

  if(cycleLength === edgeCount) {
    // cycle of proper length found
    return true;
  }

  // cycled too soon
  throw new Error(
    `Cycle length of ${cycleLength} is too short; expected ${edgeCount}.`);
};

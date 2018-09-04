/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const _engines = new Map();

const api = {};
module.exports = api;

/**
 * Registers a solver engine or gets an existing one.
 *
 * @param name the name of the solver engine.
 * @param engine the engine API.
 *
 * @return the engine API.
 */
api.use = (name, engine) => {
  if(!(name && typeof name === 'string')) {
    throw new Error(`"name" must be a string identifying the engine.`);
  }

  if(engine === undefined) {
    engine = _engines.get(name);
    if(!engine) {
      throw new Error(`Unknown engine: "${name}".`);
    }
    return engine;
  }

  if(!(engine && engine === 'object' && typeof engine.solve === 'function')) {
    throw new Error(
      `"engine" must be an object that defines a "solve" function.`);
  }

  _engines.set(name, engine);
};

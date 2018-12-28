/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const api = {};
module.exports = api;

api.constants = require('./lib/constants');
api.engines = require('./lib/engines');
api.solve = require('./lib/solve').solve;
api.solveChain = require('./lib/solve').solveChain;
api.verify = require('./lib/verify').verify;
api.verifyChain = require('./lib/verify').verifyChain;

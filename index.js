/**
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const api = {};
module.exports = api;

api.engines = require('./lib/engines');
api.solve = require('./lib/solve').solve;
api.verify = require('./lib/verify').verify;

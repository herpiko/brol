'use strict';

const mongoose = require('mongoose');
const config = require('../config');
mongoose.connect(config.mongodb);

module.exports = mongoose;

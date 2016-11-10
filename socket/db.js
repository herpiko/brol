'use strict';

const mongoose = require('mongoose');
const config = require('../config');
mongoose.connect('mongodb://localhost/brol');

module.exports = mongoose;

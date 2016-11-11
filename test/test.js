require('mocha');
require('../index');

var socket1 = require('socket.io-client')('http://localhost:3000'); // abe
var socket2 = require('socket.io-client')('http://localhost:3000'); // piko
var socket3 = require('socket.io-client')('http://localhost:3000'); // moko

const assert = require('assert');

describe('Auth', () => {
  describe('Login', () => {
    it('Sould be able to login', (done) => {
      socket1.on('authenticated', () => {
        done();    
      })
      socket1.emit('authentication', {username: 'abe', password : 'eba'});
    })
  })
})


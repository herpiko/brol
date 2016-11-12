'use strict';
const mocha = require('mocha');

/* mocha.setup({ */
/*   timeout : 10000, */
/*   slow : 5000, */
/* }) */
require('../index');

var socket = {}

var disconnect = function() {
  let keys = Object.keys(socket);
  for (var i in keys) {
    if (socket[keys[i]]) {
      socket[keys[i]].disconnect();
    }
  }
  socket = {};
}

const should = require('should');

describe('Socket', () => {
  beforeEach((done) => {
    socket.abe = require('socket.io-client')('http://localhost:3000'); // abe
    socket.piko = require('socket.io-client')('http://localhost:3000'); // piko
    socket.moko = require('socket.io-client')('http://localhost:3000'); // moko
    setTimeout(() => {
      done();
    }, 500);
  })
  describe('Auth', () => {
    it('Should be able to login', (done) => {
      socket.abe.on('authenticated', () => {
        disconnect();
        done();    
      })
      socket.abe.emit('authentication', {username: 'abe', password : 'eba'});
    })
  })
  describe('Messaging', () => {
    it('Sould be able to get online users', (done) => {
        socket.piko.on('onlineUsers', (data) => {
          console.log(data);
          should(data[0].username).equal('piko');
          should(data[0].socketId.length).equal(20);
          disconnect();
          done();    
        })
      socket.piko.emit('authentication', {username: 'piko', password : 'okip'});
    })
    it('Should be able to send message, from piko to abe', (done) => {
      socket.abe.on('message', (data) => {
        console.log(data);
        disconnect();
        done();
      })
      socket.piko.emit('message', {sender: 'piko', recipient: 'abe', message: 'hi', type: 'private'});
    })
    it('Should be able to send message, from abe to piko', (done) => {
      socket.abe.emit('message', {sender: 'abe', recipient: 'piko', message: 'eh', type: 'private'});
      socket.piko.on('message', (data) => {
        console.log(data);
        disconnect();
        done();
      })
    })
    /* it('Should', (done) => { */
    /* }) */
  })
})


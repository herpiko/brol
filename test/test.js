'use strict';
const mocha = require('mocha');

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
      socket.abe.emit('authentication', {username: 'abe', password : 'eba'});
      socket.piko.emit('authentication', {username: 'piko', password : 'okip'});
      socket.moko.emit('authentication', {username: 'moko', password : 'okom'});
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
          should(data[0].socketId.length).equal(20);
          disconnect();
          done();    
        })
      socket.piko.emit('authentication', {username: 'piko', password : 'okip'});
    })
    it('Should be able to send message, from piko to abe', (done) => {
      socket.abe.on('message', (data) => {
        should(data.sender).equal('piko');
        should(data.recipient).equal('abe');
        should(data.message).equal('hi');
        should(data.type).equal('private');
        disconnect();
        done();
      })
      socket.piko.emit('message', {sender: 'piko', recipient: 'abe', message: 'hi', type: 'private'});
    })
    it('Should be able to send message, from abe to piko', (done) => {
      socket.abe.emit('message', {sender: 'abe', recipient: 'piko', message: 'eh', type: 'private'});
      socket.piko.on('message', (data) => {
        should(data.sender).equal('abe');
        should(data.recipient).equal('piko');
        should(data.message).equal('eh');
        should(data.type).equal('private');
        disconnect();
        done();
      })
    })
    /* it('Should', (done) => { */
    /* }) */
  })
})


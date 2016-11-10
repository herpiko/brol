'use strict';

const Vue = require('vue/dist/vue.js');
const _ = require('underscore');

window.auth = new Vue({
  el  : '#auth',
  data : {
    credential : {
      username : '',
      password : '',
    },
    authenticated : false,
  },
  methods : {
    logout : function(){
      this.credential = {};
      this.authenticated = false;
      window.brol.credential = {};
      window.brol.authenticated = false;
      window.brol.rooms = { main : [] }
    },
    login : function(){
      window.credential = this.credential;
      window.brol.credential = credential;
      window.socket = io();
      window.socket.emit('authentication', {username : this.credential.username, password : this.credential.password});
      window.socket.on('authenticated', function(){
        console.log('authenticated');
        window.brol.authenticated = true;
        window.auth.authenticated = true;
      })
      
      // Events
      window.socket.on('unauthorized', function(err) {
        alert(err.message);
        window.localStorage.clear('credential');
      });
      
      window.socket.on('authenticated', function(){
        window.localStorage.setItem('credential', JSON.stringify(window.auth.credential));
        window.socket.on('message', function(msg) {
          console.log(msg);
        	if (msg.recipient) {
            var room = msg.username;
    	      if (window.credential.username != msg.recipient) {
              room = msg.recipient;
            }
    	      window.brol.switchRoom(room);
            // Update contacted list
            if (_.filter(window.brol.contacted,function(contacted){return (contacted.id == msg.username)}).length < 1) {
              window.brol.contacted.push({
                username : msg.username,
                owner : msg.recipient,
                type : 'user',
                lastTimeStamp : new Date(),
              })
            } else {
              // TODO resorting
            }
            if (_.filter(window.brol.contacted,function(contacted){return (contacted.id == msg.recipient)}).length < 1) {
              window.brol.contacted.push({
                username : msg.recipient,
                owner : msg.username,
                type : 'user',
                lastTimeStamp : new Date(),
              })
            } else {
              // TODO resorting
            }
            return window.brol.rooms[room].messages.push(msg);
        	}
          window.brol.rooms.main.messages.push(msg);

        });
        
        window.socket.on('onlineUsers', function(online) {
          window.brol.online = online;
        })
        window.socket.on('contactedUpdate', function(contacted) {
          console.log('contacted update');
          window.brol.contacted = contacted;
        })
      })
    }
  }
})

try {
  console.log('try to login');
  var credential = JSON.parse(window.localStorage.getItem('credential'));
  if (credential && credential !== null && credential.username && credential.password) {
    window.auth.credential = credential;
    window.auth.login();
  }
} catch(err) {
    console.log('try to login but nay');
    console.log(err);
}

module.exports = window.auth;

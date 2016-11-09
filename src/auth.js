'use strict';

const Vue = require('vue/dist/vue.js');

window.auth = new Vue({
  el  : '#auth',
  data : {
    credential : {
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
        window.brol.askCredential();
      });
      
      window.socket.on('authenticated', function(){
        window.socket.on('message', function(msg) {
          console.log(msg);
        	if (msg.recipient) {
            var room = msg.username;
    	      if (window.credential.username != msg.recipient) {
              room = msg.recipient;
            }
    	      window.brol.switchRoom(room);
            return window.brol.rooms[room].messages.push(msg);
        	}
          window.brol.rooms.main.messages.push(msg);
        });
        
        window.socket.on('onlineUsers', function(online) {
          window.brol.online = online;
        })
      })
    }
  }
})

module.exports = window.auth;

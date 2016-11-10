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
      window.localStorage.clear('credential');
    },
    login : function(){
      window.credential = this.credential;
      window.brol.credential = credential;
      window.socket = io();
      window.socket.emit('authentication', {username : this.credential.username, password : this.credential.password});
      
      // Events
      window.socket.on('unauthorized', function(err) {
        alert(err.message);
        window.localStorage.clear('credential');
      });
      
      window.socket.on('authenticated', function(){
        console.log('authenticated');
        window.brol.authenticated = true;
        window.auth.authenticated = true;
        window.localStorage.setItem('credential', JSON.stringify(window.auth.credential));
        
        // Get the latest contacted list
        window.socket.emit('contactedUpdate', window.auth.credential.username);

        // The authenticated events begin here
        window.socket.on('message', function(msg) {
        	if (msg.recipient) {
            var room = msg.username;
    	      if (window.credential.username != msg.recipient) {
              room = msg.recipient;
            }
            if (msg.type === 'group') {
              room = msg.recipient;
            }
    	      window.brol.switchRoom(room);
            // Update contacted list
            if (_.filter(window.brol.contacted,function(contacted){return (contacted.username == msg.username)}).length < 1) {
              window.brol.contacted.push({
                username : msg.username,
                owner : msg.recipient,
                type : 'user',
                lastTimeStamp : new Date(),
              })
            } else {
              // TODO resorting
            }
            if (_.filter(window.brol.contacted,function(contacted){return (contacted.username == msg.recipient)}).length < 1) {
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
          window.brol.$set(window.brol, 'contacted', contacted);
        })
        window.socket.on('messages', function(data) {
            window.brol.rooms[data.room].messages = data.messages;
        })
      })
    }
  }
})

try {
  var prevCredential = JSON.parse(window.localStorage.getItem('credential'));
  if (prevCredential && prevCredential !== null && prevCredential.username && prevCredential.username.length > 0 && prevCredential.password && prevCredential.password.length > 0) {
    window.auth.credential = prevCredential;
    window.auth.login();
  }
} catch(err) {
    console.log(err);
}

module.exports = window.auth;

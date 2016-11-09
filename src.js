var Vue = require('vue/dist/vue.js');

window.brol = new Vue({
  el : '#brol',
  data : {
    currentRoom : 'main',
    credential : {
    },
    socket : io(),
    messageInput : '',
    rooms : {
      main : {
        name : 'main',
        messages : [],
      },
    },
    online : [],
    authenticated : false,
  },
  methods : {
    // Main ethods
    switchRoom : function(room) {
      this.currentRoom = room;
      if (!this.rooms[room]) {
        this.$set(this.rooms, room, {
          name : room,
          messages : [],
        })
      }
    },
    sendMessage : function() {
      if (!this.messageInput || (this.messageInput && this.messageInput.length < 1)) {
        return;
      }
	    var msg = { username : this.credential.username , message : this.messageInput }
	    if (this.currentRoom !== 'main') {
	    	msg.recipient = this.currentRoom;
	    }
      console.log(msg);
      window.socket.emit('message', msg);
      this.messageInput = '';
    },
    privateChat : function(username) {
    }
  }
})
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

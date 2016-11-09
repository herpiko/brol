var Vue = require('vue/dist/vue.js');

window.brol = new Vue({
  el : '#brol',
  data : {
    currentRoom : 'main',
    credential : {},
    socket : io(),
    messageInput : '',
    messages : {
      main : [],
    }
  },
  methods : {
    askCredential : function(){
      this.credential.username = prompt('Username : ');
      this.credential.password = prompt('password : ');
      console.log(this.credential);
      this.socket = io();
      this.socket.emit('authentication', {username : this.credential.username, password : this.credential.password});
    },
    switchRoom : function(room) {
      if (room) {
        this.currentRoom = room;
      } else {
        if (this.currentRoom === 'main') {
        } else {
        }
      } 
    },
    sendMessage : function() {
	    var msg = { username : this.credential.username , message : this.messageInput }
	    if (this.currentRoom !== 'main') {
	    	msg.recipient = this.currentRoom;
	    }
      this.socket.emit('message', msg);
      this.messageInput = '';
    },
    privateChat : function(username) {
    	if (this.credential.username == username) {
    		return;	
    	}
    	this.switchRoom(username);
    }
  }
})

window.brol.askCredential();

// Events
window.brol.socket.on('unauthorized', function(err) {
  alert(err.message);
  window.brol.askCredential();
});

window.brol.socket.on('message', function(msg) {
  console.log(msg);
	if (msg.recipient) {
		if (window.brol.credential.username === msg.recipient) {
			window.brol.privateChat(msg.username);
		} else {
			window.brol.privateChat(msg.recipient);
		}
    return $('#privatemessages').append($('<li>').text(msg.username + ' : ' + msg.message));
	}
  window.brol.messages.main.push(msg);
});

window.brol.socket.on('onlineUsers', function(online) {
  window.brol.online = online;
})


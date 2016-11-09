'use strict';

const Vue = require('vue/dist/vue.js');

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
      if (!this.rooms[room]) {
        this.$set(this.rooms, room, {
          name : room,
          messages : [],
        })
      }
      this.currentRoom = room;
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

module.exports = window.brol;

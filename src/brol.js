'use strict';

const Vue = require('vue/dist/vue.js');
const _ = require('underscore');
window.brol = new Vue({
  el : '#brol',
  data : {
    currentRoom : 'main',
    currentRoomDetail : {},
    credential : {
      username : '',
      password : '',
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
    contacted : [],
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
      this.fetchMessages({room : room});
      // check for group
      var currentContact = _.find(window.brol.contacted, function(contact){
        return (contact && contact.username == room);
      })
      if (currentContact) {
        this.$set(this, 'currentRoomDetail', currentContact);
      } else {
        this.$set(this, 'currentRoomDetail', {});
      }
    },
    sendMessage : function() {
      if (!this.messageInput || (this.messageInput && this.messageInput.length < 1)) {
        return;
      }
	    var msg = { 
        sender : this.credential.username,
        message : this.messageInput,
        type : 'private',
      }
      if (this.rooms[this.currentRoom] && this.rooms[this.currentRoom].type && this.rooms[this.currentRoom].type === 'group') {
        msg.type = 'group';
      }
	    if (this.currentRoom !== 'main') {
	    	msg.recipient = this.currentRoom;
	    } else {
      
      }
      window.socket.emit('message', msg);
      this.messageInput = '';
    },
    fetchMessages : function(query) {
      window.socket.emit('fetchMessages', query);
    },
  }
})

module.exports = window.brol;

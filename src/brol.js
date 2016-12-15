'use strict';

const Vue = require('vue/dist/vue.js');
const _ = require('underscore');
window.brol = new Vue({
  el : '#brol',
  data : {
    currentRoom : {
      name : 'main',
    },
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
    // Main methods
    switchRoom : function(room) {
      console.log('========================');
      console.log(room)
      if (!room.name && room.username) {
        room.name = room.username;
      }
      if (!room.name) {
        room.name = room._id;
      }
      if (!this.rooms[room._id]) {
        this.$set(this.rooms, room._id, {
          name : room.name,
          id : room._id,
          messages : [],
        })
      }
      this.$set(this, 'currentRoom', { name : room.name, id : room._id})
      this.fetchMessages({room : room._id});
      // check for group
      var currentContact = _.find(window.brol.contacted, function(contact){
        return (contact && contact.id == room._id);
      })
      if (currentContact) {
        this.$set(this, 'currentRoom', currentContact);
      /* } else { */
      /*   this.$set(this, 'currentRoom', {}); */
      }
    },
    sendMessage : function() {
      if (!this.messageInput || (this.messageInput && this.messageInput.length < 1)) {
        return;
      }
	    var msg = { 
        sender : this.credential.id,
        message : this.messageInput,
        type : 'private',
      }
      if (this.rooms[this.currentRoom.id] && this.rooms[this.currentRoom.id].type && this.rooms[this.currentRoom.id].type === 'group') {
        msg.type = 'group';
      }
	    if (this.currentRoom.name !== 'main') {
	    	msg.recipient = this.currentRoom.id;
	    } else {
      
      }
      console.log('Push the message to current room ' + window.brol.currentRoom.id);
      window.brol.rooms[window.brol.currentRoom.id].messages.push(msg);
      console.log(window.brol.rooms[window.brol.currentRoom.id].messages);
      window.socket.emit('message', msg);
      this.messageInput = '';
    },
    fetchMessages : function(query) {
      window.socket.emit('fetchMessages', query);
    },
  }
})

module.exports = window.brol;

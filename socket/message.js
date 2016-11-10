'use strict';

const db = require('./db');
const Schema = db.Schema;
const config = require('../config');
const users = require('./users');

var messageSchema = new Schema({
  message : String,
  sender : String,
  recipient : String,
  recipientType : String,
  timestamp : Date,
  status : String,
});

var contactedListSchema = new Schema({
  username : String,
  owner : String,
  type : String,
  lastTimeStamp : Date,
  unread : Number
});

function MessageHandler(msg) {
  this.msg = msg;
  this.model = db.model('Message', messageSchema);
  this.contactedModel = db.model('Contacted', contactedListSchema);
  this.userModel = users.model;
}

MessageHandler.prototype.process = function(io, socket) {
  if (this.msg.recipient) {
    // TODO check wether if its online or not first
    let message = {
      message : this.msg.message,
      sender : this.msg.username,
      recipient : this.msg.recipient,
      timestamp : new Date,
      status : 'arrived',
    }
    this.model.create(message, (err, result) => {
      // TOOD check err
      this.userModel.findOne({username : this.msg.recipient}, (err, user) => {
        // TODO check err
        if (user) {
          io.to(user.socketId).emit('message', this.msg);
        }
      })
      io.to(socket.client.id).emit('message', this.msg);
    })
    
    var updateContacted = function(contacted) {
    }
    
    const options = {
      upsert : true,
      new : true,
      setDefaultsOnInsert : true,
    }
    let contacted = {
      username : this.msg.recipient,
      owner : this.msg.username,
      type : 'user',
      lastTimeStamp : new Date(),
    }

    this.contactedModel.findOneAndUpdate({owner : contacted.owner }, contacted, options);
    contacted.username = this.msg.username;
    contacted.owner = this.msg.recipient;
    this.contactedModel.findOneAndUpdate({owner : contacted.owner }, contacted, options);

    // else if (groups[msg.recipient]) {
    // Handle group message
    //}
  } else {
    io.emit('message', this.msg);
  }
}

module.exports = MessageHandler;

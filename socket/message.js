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
  type : String // private or group
});

var contactedListSchema = new Schema({
  username : String,
  owner : String,
  type : String,
  lastTimeStamp : Date,
  unread : Number
});

var groupSchema = new Schema({
  name : String,
  members : [],
})
const messageModel = db.model('Message', messageSchema);
const contactedModel = db.model('Contacted', contactedListSchema);
const groupModel = db.model('Group', groupSchema);
const userModel = users.model;

function MessageHandler(msg) {
  this.msg = msg;
  this.model = messageModel;
  this.contactedModel = contactedModel;
  this.groupModel = groupModel;
  this.userModel = userModel;
}

MessageHandler.prototype.process = function(io, socket) {
  if (this.msg.recipient) {
    // TODO check wether if its online or not first
    let message = {
      message : this.msg.message,
      sender : this.msg.sender,
      recipient : this.msg.recipient,
      type : this.msg.type,
      timestamp : new Date,
      status : 'arrived',
    }
    this.model.create(message, (err, result) => {
      // TOOD check err
      if (message.type === 'group') {
        this.groupModel.findOne({name : message.recipient}, (err, result) => {
          // TODO check err
          if (result) {
            for (var i in result.members) {
              this.userModel.findOne({username : result.members[i]}, (err, user) => {
                // TODO check err
                if (user) {
                  io.to(user.socketId).emit('message', this.msg);
                }
              });
            }
          }
        })
      } else {
        // Send message to both respondents
        this.userModel.findOne({username : this.msg.recipient}, (err, user) => {
          // TODO check err
          if (user) {
            io.to(user.socketId).emit('message', this.msg);
          }
        })
        io.to(socket.client.id).emit('message', this.msg);
      }
    })
    
    // Update contacted list to both respondents
    const options = {
      upsert : true,
      new : true,
      setDefaultsOnInsert : true,
    }
    let contacted = {
      username : this.msg.recipient,
      owner : this.msg.sender,
      type : 'user',
      lastTimeStamp : new Date(),
    }

    this.contactedModel.findOneAndUpdate({owner : contacted.owner }, contacted, options, (err, result) => {
      // Do nothing
    });
    contacted.username = this.msg.sender;
    contacted.owner = this.msg.recipient;
    this.contactedModel.findOneAndUpdate({owner : contacted.owner }, contacted, options, (err, result) => {
      // Do nothing
    });
  } else {
    io.emit('message', this.msg);
  }
}

module.exports = {
  MessageHandler : MessageHandler,
  groupModel : groupModel,
  contactedModel : contactedModel,
  messageModel : messageModel,
}

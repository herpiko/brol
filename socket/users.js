'use strict';

const db = require('./db');
const Schema = db.Schema;

var userSchema = new Schema({
  username : String,
  password : String,
  lastSeen : Date,
  socketId : String,
})

const model = db.model('User', userSchema);

function UserManager() {
  this.model = model;
}

UserManager.prototype.isUserOnline = function(user) {
  /* if(users[user].socketId) { */
  /*   return true; */
  /* } else { */
  /*   return false; */
  /* } */
}

UserManager.prototype.getOnlineUsers = function() {
  return new Promise((resolve, reject) => {
    this.model.find({ socketId : { $ne : null } }, {password:-1}, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  })
}

UserManager.prototype.authUser = function(username, password) {
  return new Promise((resolve, reject) => {
    this.model.find({username : username, password : password }, (err, result) => {
      if (err) {
        return reject();
      }
      if (!result || (result && result.length < 1)) {
        return reject();
      }
      resolve();
    })
  })
}

UserManager.prototype.setSocketId = function(id, socketId) {
  return new Promise((resolve, reject) => {
    this.model.findOneAndUpdate({ _id : id }, { socketId : socketId }, (err, result) => {
      if (err) {
        return reject();
      }
      resolve(result);
    });
  })
}

UserManager.prototype.removeSocketId = function(socketId) {
  return new Promise((resolve, reject) => {
    this.model.findOneAndUpdate({ socketId : socketId }, { socketId : null }, (err, result) => {
      if (err) {
        return reject();
      }
      resolve(result);
    });
  })
}

module.exports = {
 UserManager : UserManager,
 model : model,
}

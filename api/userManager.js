//Class untuk manage user, sebelum menggunakan database, di constructor menerima users yang berasal dari JSON

function UserManager(users) {
  this.users = users;
  _ = require("underscore");
}

UserManager.prototype.isUserOnline = function(user) {
  if(users[user].socketId) {
    return true;
  } else {
    return false;
  }
}

UserManager.prototype.getOnlineUsers = function() {
  return _.filter(this.users, function(user) {
    return user.hasOwnProperty('socketId');
  });
}

UserManager.prototype.authUser = function(username, password) {
  if(this.users[username] && this.users[username].password === password) {
    return true;
  } else {
    return false;
  }
}

UserManager.prototype.setSocketId = function(username, socketId) {
  this.users[username].socketId = socketId;
}

UserManager.prototype.removeSocketId = function(socketId) {
  var user = _.find(this.users, function(user) {
    return user.socketId = socketId;
  });

  delete user.socketId;
}

module.exports = UserManager;

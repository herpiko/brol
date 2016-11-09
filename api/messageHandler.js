function MessageHandler(msg, users) {
  this.msg = msg;
  this.users = users;
}

MessageHandler.prototype.process = function(io, socket) {
  if (this.msg.recipient) {
    if (this.users[this.msg.recipient]) {
      io.to(this.users[this.msg.recipient].socketId).emit('message', this.msg);
      io.to(socket.client.id).emit('message', this.msg);
    }
    // else if (groups[msg.recipient]) {
    // Handle group message
    //}
  } else {
    io.emit('message', this.msg);
  }
}

module.exports = MessageHandler;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');
var MessageHandler = require('./message');
var UserManager = require('./users').UserManager;

var userManager = new UserManager();

var updateOnlineUsers = function(){
  userManager.getOnlineUsers()
  .then((onlineUsers) => {
    io.emit('onlineUsers', onlineUsers);
  })
  .catch((err) => {
    console.log(err);
  })
}


function authenticate(socket, data, cb) {
  var authenticated = false;
  userManager.authUser(data.username, data.password)
  .then(() => {
    console.log('a user connected');
    userManager.setSocketId(data.username, socket.client.id);
    setTimeout(function(){
      io.to(socket.client.id).emit('message', {username : 'bot', message : 'welcome'});
      updateOnlineUsers();
    }, 500);

    return cb(null, true);
  })
  .catch(() => {
    return cb(new Error('Invalid credential'));
  })
}

require('socketio-auth')(io, {
  authenticate : authenticate,
  timeout : 1000,
})

app.use(express.static('public'));

io.on('connection', (socket) => {

  // Events
  socket.on('disconnect', () => {
    console.log('user disconnected : ' + socket.client.id);
    userManager.removeSocketId(socket.client.id);
    updateOnlineUsers();
  });

  socket.on('message', (msg) => {
    new MessageHandler(msg).process(io, socket);
  })
})

http.listen(3000, () => {
  console.log('listening on port 3000');
});

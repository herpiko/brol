var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');
var users = require('./users.json');
var groups = require('./groups.json');
var MessageHandler = require('./MessageHandler');
var UserManager = require('./UserManager');

var userManager = new UserManager(users);

function authenticate(socket, data, cb) {
  var authenticated = false;
  if (userManager.authUser(data.username, data.password)) {
    userManager.setSocketId(data.username, socket.client.id);
    return cb(null, true);
  } else {
    return cb(new Error('Invalid credential'));
  }
}

require('socketio-auth')(io, {
  authenticate : authenticate,
  timeout : 1000,
})

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');

  var updateOnlineUser = function(){
    var onlineUsers = userManager.getOnlineUsers();
    io.emit('onlineUsers', onlineUsers);
  }

  setTimeout(function(){
    io.to(socket.client.id).emit('message', {username : 'Server', message : 'Selamat datang.'});
    updateOnlineUser();
  }, 500);


  // Events
  socket.on('disconnect', () => {
    console.log('user disconnected : ' + socket.client.id);
    userManager.removeSocketId(socket.client.id);
    updateOnlineUser();
  });

  socket.on('message', (msg) => {
    new MessageHandler(msg, users).process(io, socket);
  })
})

http.listen(3000, () => {
  console.log('listening on port 3000');
});

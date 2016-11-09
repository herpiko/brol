var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');
var users = require('./users.json');
var groups = require('./groups.json');

function authenticate(socket, data, cb) {
  var authenticated = false;
  if (users[data.username] && users[data.username].password === data.password) {
    socket.client.user = users[data.username];
    users[data.username].socketId = socket.client.id;
    return cb(null, true);
  } else {
    return cb(new Error('Invalid credential'));
  }
}

require('socketio-auth')(io, {
  authenticate : authenticate,
  timeout : 1000,
})

/* app.get('/', (req, res) => { */
/*   res.sendFile(__dirname + '/index.html'); */
/* }); */
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');

  var updateOnlineUser = function(){
    io.emit('onlineUsers', users);
  }

  setTimeout(function(){
    io.to(socket.client.id).emit('message', {username : 'Server', message : 'Selamat datang.'});
    updateOnlineUser();
  }, 500);


  // Events
  socket.on('disconnect', () => {
    console.log('user disconnected : ' + socket.client.id);
    for (var i in users) {
      if (users[i].socketId && users[i].socketId === socket.client.id) {
        delete(users[i].socketId);
      }
    }
    updateOnlineUser();
  });
  
  socket.on('message', (msg) => {
    if (msg.recipient) {
      if (users[msg.recipient]) {
        io.to(users[msg.recipient].socketId).emit('message', msg);
        io.to(socket.client.id).emit('message', msg);
      /* } else if (groups[msg.recipient]) { */
      /*   for (var i in groups[msg.recipient]) { */
      /*   } */
			// Handle group message
			}
    } else {
      io.emit('message', msg);
    }
  })
})

http.listen(3000, () => {
  console.log('listening on port 3000');
});

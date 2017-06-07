'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const message = require('./message');
const MessageHandler = message.MessageHandler;
const contactedModel = message.contactedModel;
const messageModel = message.messageModel;
const groupModel = message.groupModel;
const pub = message.pub;
const sub = message.sub;
const zpub = message.zpub;
const zsub = message.zsub;
const users = require('./users');
const UserManager = users.UserManager;
const userModel = users.model;
const io = require('socket.io')(http);
const router = require('socket.io-events')();
users.router(router);
io.use(router)

// Assign router to user module

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
  console.log(`${data.username} login`)
  userManager.authUser(data.username, data.password)
  .then((user) => {
    console.log('a user connected');
    userManager.setSocketId(user._id, socket.client.id);
    setTimeout(function(){
      io.to(socket.client.id).emit('message', {sender : 'bot', message : 'welcome'});
      updateOnlineUsers();
    }, 500);
    return cb(null, { id : user._id, username : user.username });
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
    pub.hget(socket.client.id, function(err, result){
      pub.del(socket.client.id);
      if (result) {
        pub.del(result);
      }
    });
    userManager.removeSocketId(socket.client.id);
    updateOnlineUsers();
  });

  socket.on('message', (msg) => {
    new MessageHandler(msg).process(io, socket);
  });

  socket.on('fetchMessages', (query) => {
    // search the current username
    userModel.findOne({socketId : socket.client.id}, (err, user) => {
      // TODO check err
      if (user && user.socketId) {
        messageModel.find({ '$or' : [
          {sender : query.room , recipient : user.username }, 
          {sender : user.username, recipient : query.room},
          // group
          {sender : query.room, type : 'group' }, 
        ]}, (err, messages) => {
          // TODO check err
          var data = {
            room : query.room,
            messages : messages
          }
          io.to(socket.client.id).emit('messages', data );
        })
      }
    })
  })

  socket.on('contactedUpdate', (owner) => {
    // TODO Strict query
    contactedModel.find({owner : owner}, (err, contacted) => {
      // TODO check err
      groupModel.find({members : { $in : [owner] }}).lean().exec((err, groups) => {
        // Is this realy needed?
        if (groups && groups.length > 1) {
          for (var i in contacted) {
            if (contacted[i].type && contacted[i].type === 'group') {
              for (var j in groups) {
                if (contacted[i].username === groups[j].name) {
                  groups[j].exists = true;   
                }
              }
            }
          }
          for (var k in groups) {
            if (!groups[k].exists) {
              var group = groups[k];
              group.username = group.name;
              group.type = 'group';
              contacted.push(group); 
            }
          }
        }
        console.log('contacted list : ');
        console.log(contacted);
        io.to(socket.client.id).emit('contactedUpdate', contacted);
      })
    })
  })
})

http.listen(3000, () => {
  pub.on('ready', () =>  {
    console.log('PUB ready');
    sub.on('ready', () => {
      console.log('SUB ready');
      zsub.subscribe('chat:messages:latest');
    })
  })
  console.log('listening on port 3000');
});

'use strict';

const db = require('./db');
const Schema = db.Schema;
const pub = require('./message').pub;
const config = require('../config.json');
const nodemailer = require('nodemailer');
const credential = `smtps:\/\/${config.mailer.username}:${config.mailer.password}@smtp.gmail.com`;
const transporter = nodemailer.createTransport(credential);

var userSchema = new Schema({
  username : String,
  password : String,
  lastSeen : Date,
  socketId : String,
  active : Boolean,
  activationCode : String,
  // TODO activation code expiration
})

const Model = db.model('User', userSchema);

// User Manager

function UserManager() {
  this.Model = Model;
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
    this.Model.find({ socketId : { $ne : null } }, {username:1}, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  })
}

UserManager.prototype.authUser = function(username, password) {
  return new Promise((resolve, reject) => {
    this.Model.find({username : username, password : password }, (err, result) => {
      if (err) {
        return reject();
      }
      if (!result || (result && result.length < 1)) {
        return reject();
      }
      resolve(result[0]);
    })
  })
}

UserManager.prototype.setSocketId = function(id, socketId) {
  return new Promise((resolve, reject) => {
    /* pub.hset(id, socketId); */
    /* pub.hset(socketId, id); */
    this.Model.findOneAndUpdate({ _id : id }, { socketId : socketId }, (err, result) => {
      if (err) {
        return reject();
      }
      resolve(result);
    });
  })
}

UserManager.prototype.removeSocketId = function(id, socketId) {
  return new Promise((resolve, reject) => {
    /* pub.hset(id, socketId); */
    this.Model.findOneAndUpdate({ socketId : socketId }, { socketId : null }, (err, result) => {
      if (err) {
        return reject();
      }
      resolve(result);
    });
  })
}

// User Routers

const router = function(router) {
  router.on('activation', (socket,args, next) => {
    console.log('activation');
    let body = args[1], res = args[2];
    Model.findOne({username: body.username, activationCode : body.activationCode, active : false}, (err, result) => {
      if (err) {
        return res(err);
      }
      if (!result) {
        return res('Not found');
      }
      Model.findOneAndUpdate({username : body.username}, {active : true}, (err, result) => {
        return res(null, true);
      })
    })
  })
  router.on('register', function(socket, args, next) {
    console.log('register');
    let body = args[1], res = args[2];
    Model.find({$or : [
      {username : body.username},
      // TODO Check by email too
      /* {email : body.email} */
    ]}, (err, result) => {
      if (err) {
        return res(err);
      }
      if (!result || (result && result.length < 1)) {
        const activationCode = (new Date()).valueOf().toString(16).substr(-4,4).toUpperCase();
        var user = new Model({username : body.username, password : body.password, active : false, activationCode : activationCode});
        user.save(() => {
          if (err) {
            return res(err);
          }
          const mailOptions = {
            from : `brol`,
            to : body.email,
            subject : '[brol messaging] Your activation code',
            html : `Your activation code : ${activationCode}`
          }
          console.log(mailOptions);
          transporter.sendMail(mailOptions, (err, info) => {
            console.log(err);
            console.log(info);
          });
          return res(null, true);
        })
      } 
    })
  })
}

module.exports = {
 UserManager : UserManager,
 model : Model,
 router : router
}

### brol

[![Build Status](https://api.travis-ci.org/KodeKreatif/brol.svg)](https://travis-ci.org/KodeKreatif/brol)

### Requirements

- MongoDB
- Node v6.x

### Run

With docker, `./deploy.sh`

or

```
$ npm install -g yarn browserify uglifyjs
$ yarn
$ npm run init
$ npm run dev
```

### Test

`$ npm run test`

then open `http://localhost:3000`

### Emitters

#### Client

- `authentication`, `({username : String, password : String})` - login into the socket
- `message`, `({sender: String, recipient: String, message: String, type : String })` - send message.
- `fetchMessage`, `({room : String})`
- `contactedUpdate`, `currentUsername`

#### Server

- On progress...

### Events

#### Client

- `authenticated` - when authentication succeeded.
- `unauthorized` - when authentication failed.
- `message`, `({sender: String, recipient: String, message: String, type : String })` - when message arrived.
- `contactedUpdate`, `[]` - updated contacted list from server.
- `onlineUsers`, `[]` - server send online users list from server
- `messages`, `{ rooms : String, messages : [] }` - messages list from server

#### Server

- On progress...

### TODO

- API (basic user registration, fetch unread, etc)
- Messages queue
- Messages promise
- Message status (sent, read, etc)
- Groups

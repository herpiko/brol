### brol

### Requirements

- MongoDB

### Run

With docker, `./deploy.sh`

or

```
$ yarn
$ npm run init
$ npm run dev
```

then open `http://localhost:3000`

### Emitters

#### Client

- `authentication`, `({username : String, password : String})`
- `message`, `({sender: String, recipient: String, message: String, type : String })`
- `fetchMessage`, `({room : String})`
- `contactedUpdate`, `currentUsername`

#### Server

- On progress...

### Events

#### Client

- On progress...

#### Server

- On progress...

### TODO

- API (basic user registration, fetch unread, etc)
- Messages queue
- Messages promise
- Message status (sent, read, etc)
- Groups

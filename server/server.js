const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const http = require("http")
const socketIO = require("socket.io")
// const { ExpressPeerServer } = require("peer")
const { v4: uuid } = require("uuid")

app = express()
server = http.Server(app)
io = socketIO(server, { origins: '*:*' }) // I don't understand this part :(

// global variables
const PORT = 3000
const MONGO_URI = "mongodb+srv://Shine:<password>@cluster0.1kbpx.mongodb.net/<dbname>?retryWrites=true&w=majority"
const welcomeMessage = "Welcome to Shine's chat app!"
let userIDToSocketMap = {}
// let userIDToWaitQueueMap = {}

// Middleware to parse search params
app.use(bodyParser.json())

// Middleware to resolve cors!
app.use(cors())

app.get('/', (req, res) => {
    res.send({ "msg": welcomeMessage })
})

// listen on the connection event for incoming sockets
io.on('connection', function (socket) {
    console.log('A new client connected', socket.id);

    socket.on('logged-in', userID => {
        userIDToSocketMap[userID] = socket
    })

    socket.on('send-message', msgObjectString => {
        let msgObject = JSON.parse(msgObjectString)
        let { receiverID } = { ...msgObject }

        if (receiverID in userIDToSocketMap) {
            let receiverSocket = userIDToSocketMap[receiverID]
            receiverSocket.emit('received-message', msgObjectString)
        } else {
            let reason = "Reciever is offline!"
            socket.emit('message-not-sent', reason, receiverID)
        }
    })
});

server.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://<%s>:%s", host, port)
})


// // Peerjs Connections
// peerServer.on('connection', (client) => {
//     console.log("(PeerJS): Got a connection from", client.id)
//     // peerServer.emit('open', client.id)
// })

/** SOCKET IO CHEATSHEET **/
//  // send to current request socket client
//  socket.emit('message', "this is a test");// Hasn't changed

//  // sending to all clients, include sender
//  io.sockets.emit('message', "this is a test"); // Old way, still compatible
//  io.emit('message', 'this is a test');// New way, works only in 1.x

//  // sending to all clients except sender
//  socket.broadcast.emit('message', "this is a test");// Hasn't changed

//  // sending to all clients in 'game' room(channel) except sender
//  socket.broadcast.to('game').emit('message', 'nice game');// Hasn't changed

//  // sending to all clients in 'game' room(channel), include sender
//  io.sockets.in('game').emit('message', 'cool game');// Old way, DOES NOT WORK ANYMORE
//  io.in('game').emit('message', 'cool game');// New way
//  io.to('game').emit('message', 'cool game');// New way, "in" or "to" are the exact same: "And then simply use to or in (they are the same) when broadcasting or emitting:" from http://socket.io/docs/rooms-and-namespaces/

//  // sending to individual socketid, socketid is like a room
//  io.sockets.socket(socketid).emit('message', 'for your eyes only');// Old way, DOES NOT WORK ANYMORE
//  socket.broadcast.to(socketid).emit('message', 'for your eyes only');// New way
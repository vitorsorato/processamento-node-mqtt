const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const req = require('express/lib/request')
const res = require('express/lib/response')
const mqtt = require('mqtt')
var client = mqtt.connect('mqtt://broker.hivemq.com')

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
    var textValue = "Message"

    client.on('message', (topic, message) => {
        textValue = message
    })

    res.render('index', {text: textValue})
})

app.get('/about', (req, res) => {
    res.render('about', {text: 'About this site'})
})

client.on('connect', () => {
  client.subscribe('humid')
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  io.sockets.emit('humid', {humid:message})

})

server.listen(3000, () => {
  console.log('listening on *:3000');
});

var userCount = 0;
io.on('connection', function(socket){
    userCount++;
    console.log(userCount);
    io.sockets.emit('userCount', {userCount:userCount})
    socket.on('disconnect', function(){
        userCount--;
        io.sockets.emit('userCount', {userCount:userCount})
        console.log(userCount);
    })
})
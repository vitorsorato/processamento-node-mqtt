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

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/favicon.ico', express.static('/favicon.ico'));


app.get('', (req, res) => {
    res.render('index', {text: "Message"})
})

app.get('/about', (req, res) => {
    res.render('about', {text: 'About this site'})
})

client.on('connect', () => {
  client.subscribe('humid', ( err , granted ) => {
    console.log(granted);
  })
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  io.sockets.emit('message', {message: message})

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

    socket.on('sendTemperatura', data => {
      console.log(data);
    })

    socket.on('sendCooler', data => {
      console.log(data);
    })
})
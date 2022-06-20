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
const port = process.env.PORT || 3000;
var ultimaTemperatura = "0.0";

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
  client.subscribe('PStemperatura', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSTemperatura', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSCooler', ( err , granted ) => {
    console.log(granted);
  })
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case "PStemperatura":
      ultimaTemperatura = message.toString();
      io.sockets.emit('ultimaTemperatura', {ultimaTemperatura})
      break;
    case "changePSTemperatura":
      changePSTemperatura = message.toString();
      io.sockets.emit('changePSTemperatura', {changePSTemperatura})
      break;
    case "changePSCooler":
      changePSCooler = message.toString();
      io.sockets.emit('changePSCooler', {changePSCooler})
      break;
    default:
      break;
  }
})

server.listen(port, () => {
  console.log('listening on *:' + port);
});

var userCount = 0;
io.on('connection', function(socket){
    userCount++;
    console.log(userCount);
    console.log(ultimaTemperatura);
    io.sockets.emit('data', {
      userCount:userCount, 
      ultimaTemperatura:ultimaTemperatura
    })
    socket.on('disconnect', function(){
        userCount--;
        io.sockets.emit('data', {
          userCount:userCount, 
          ultimaTemperatura:ultimaTemperatura})     
    })

    socket.on('sendTemperatura', data => {
      console.log(data);
      client.publish('changePSTemperatura', data)
    })

    socket.on('sendCooler', data => {
      console.log(data);
      client.publish('changePSCooler', data)
    })
})
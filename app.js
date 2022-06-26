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
var ultimaTemperatura = 27.5;
var changePSTemperatura = 27.5;
var changePSCooler = 0.0;
var PID = 0;
var changePSKp = 10.0;
var changePSKi = 5.0;
var changePSKd = 5.0;

var changePSFiltro = "semfiltro";


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
  client.subscribe('PSPID', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSTemperatura', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSCooler', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSKp', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSKi', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSKd', ( err , granted ) => {
    console.log(granted);
  })
  client.subscribe('changePSFiltro', ( err , granted ) => {
    console.log(granted);
  })
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message);

  switch (topic) {
    case "PStemperatura":
      ultimaTemperatura = message.toString();
      io.sockets.emit('ultimaTemperatura', {ultimaTemperatura})
      break;
    case "PSPID":
      PID = message.toString();
      io.sockets.emit('PSPID', {PID})
      break;
    case "changePSTemperatura":
      changePSTemperatura = message.toString();
      io.sockets.emit('changePSTemperatura', {changePSTemperatura})
      break;
    case "changePSCooler":
      changePSCooler = message.toString();
      io.sockets.emit('changePSCooler', {changePSCooler})
      break;
    case "changePSKp":
      changePSKp = message.toString();
      io.sockets.emit('changePSKp', {changePSKp})
      break;
    case "changePSKi":
      changePSKi = message.toString();
      io.sockets.emit('changePSKi', {changePSKi})
      break;
    case "changePSFiltro":
      changePSFiltro = message.toString();
      io.sockets.emit('changePSFiltro', {changePSFiltro})
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
      ultimaTemperatura:ultimaTemperatura,
      changePSTemperatura:changePSTemperatura,
      changePSCooler:changePSCooler,
      PID:PID,
      changePSKp: changePSKp,
      changePSKi: changePSKi,
      changePSKd: changePSKd,
      changePSFiltro: changePSFiltro,
    })
    io.sockets.emit('userCount', {
      userCount:userCount, 
    })
    socket.on('disconnect', function(){
        userCount--;
        io.sockets.emit('userCount', {
          userCount:userCount, 
        })     
    })

    socket.on('sendTemperatura', data => {
      console.log(data);
      client.publish('changePSTemperatura', data)
    })

    socket.on('sendCooler', data => {
      console.log(data);
      client.publish('changePSCooler', data)
    })

    socket.on('sendKp', data => {
      client.publish('changePSKp', data)
    })

    socket.on('sendKi', data => {
      client.publish('changePSKi', data)
    })

    socket.on('sendKd', data => {
      console.log(data);
      client.publish('changePSKd', data)
    })

    socket.on('filtro', data => {
      client.publish('changePSFiltro', data)
    })
})
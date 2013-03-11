var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , _ = require('underscore');

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.static('public', __dirname + 'public'));

app.get('/', function(request, response) {
  response.render('index');
});

app.post('/message', function(request, response) {

  var message = request.body.message;

  if(_.isEmpty(message.trim())) {
    return response.json(400, {error: "Message is empty"});
  }

  var sender = request.body.sender;

  io.sockets.emit('incomingMessage', {message: message, sender: sender});
  response.send(200);

});

io.on('connection', function(socket){

  socket.on('disconnect', function() {
    io.sockets.emit('userDisconnected', {id: socket.id, sender:'system'});
  });

  socket.on('newUser', function(data) {
    io.sockets.emit('newConnection', {id: data.id, sender: data.name});
  });

  socket.on('nameChange', function(data) {
    io.sockets.emit('nameChanged', {id: data.id, sender: data.sender});
  });

});

server.listen(app.get('port'));
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , _ = require('underscore')
  , participants = [];

app.set('ipaddr', process.env.INTERNAL_IP || "127.0.0.1");
app.set('port', process.env.INTERNAL_PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static('public', __dirname + 'public'));

app.get('/', function(request, response) {
  response.render('index');
});

app.post('/message', function(request, response) {

  var message = request.body.message;

  if(_.isEmpty(message.trim())) {
    return response.json(400, {error: "Message is empty"});
  }

  var name = request.body.name;

  io.sockets.emit('incomingMessage', {message: message, name: name});
  response.send(200);

});

io.on('connection', function(socket){

  socket.on('disconnect', function() {
    participants = _.without(participants,_.findWhere(participants, {id: socket.id}));
    io.sockets.emit('userDisconnected', {id: socket.id, sender:'system'});
  });

  socket.on('newUser', function(data) {
    participants.push({id: data.id, name: data.name});
    io.sockets.emit('newConnection', {participants: participants});
  });

  socket.on('nameChange', function(data) {
    _.findWhere(participants, {id: socket.id}).name = data.name;
    io.sockets.emit('nameChanged', {id: data.id, name: data.name});
  });

});

server.listen(app.get('port'), app.get('ipaddr'));

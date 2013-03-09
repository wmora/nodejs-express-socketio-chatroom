var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

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
  var sender = request.body.sender;
  io.sockets.emit('incomingMessage', {message: message, sender: sender});
  response.send(200);
});

io.on('connection', function(socket){
  console.log('New connection: ' + socket);
});

server.listen(app.get('port'));
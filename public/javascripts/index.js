function init() {
  var serverBaseUrl = 'http://localhost:3000';
  var socket = io.connect(serverBaseUrl);
  var sessionId = '';

  socket.on('connect', function () {
    sessionId = socket.socket.sessionid;
    console.log('Connected ' + sessionId);
    socket.emit('newUser', {id: sessionId, name: $('#name').val()});
  });

  socket.on('disconnect', function () {
    sessionId = socket.socket.sessionid;
    console.log('Connected ' + sessionId);
  });

  socket.on('userDisconnected', function(data) {
    $('#' + data.id).remove();
  });

  socket.on('nameChanged', function (data) {
    $('#' + data.id).text(data.sender + ' ' + (data.id === sessionId ? '(You)' : ''));
  });

  socket.on('newConnection', function (data) {
    $('#participants').append('<span id="' + data.id + '">' + data.sender + ' ' + (data.id === sessionId ? '(You)' : '') + '<br /></span>');
  });

  socket.on('incomingMessage', function (data) {
    var message = data.message;
    var sender = data.sender;
    $('#messages').prepend('<b>' + sender + '</b><br />' + message + '<hr />');
  });

  socket.on('error', function (reason) {
    console.log('Unable to connect to client', reason);
  });

  function sendMessage() {
    var outgoingMessage = $('#outgoingMessage').val();
    var sender = $('#name').val();
    $.ajax({
      url: serverBaseUrl + '/message',
      type: 'POST',
      dataType: 'json',
      data: {message: outgoingMessage, sender: sender}
    });
  }

  function outgoingMessageKeyDown(event) {
    if (event.which == 13) {
      event.preventDefault();
      if ($('#outgoingMessage').val().trim().length <= 0) {
        return;
      }
      sendMessage();
      $('#outgoingMessage').val('');
    }
  }

  function outgoingMessageKeyUp() {
    var outgoingMessageValue = $('#outgoingMessage').val();

    $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
  }

  function nameFocusOut() {
    var name = $('#name').val();
    socket.emit('nameChange', {id: sessionId, sender: name});
  }

  $('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
  $('#outgoingMessage').on('keyup', outgoingMessageKeyUp);

  $('#name').on('focusout', nameFocusOut);

  $('#send').on('click', sendMessage);
}

$(document).on('ready', init);
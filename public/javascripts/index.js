function init() {
  var serverBaseUrl = 'http://chatroom-williammora.rhcloud.com:8080';
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
    $('#' + data.id).text(data.name + ' ' + (data.id === sessionId ? '(You)' : ''));
  });

  socket.on('newConnection', function (data) {
    $('#participants').html('');
    var participants = data.participants;
    for (var i = 0; i < participants.length; i++) {
      $('#participants').append('<span id="' + participants[i].id + '">' +
        participants[i].name + ' ' + (participants[i].id === sessionId ? '(You)' : '') + '<br /></span>');
    }
  });

  socket.on('incomingMessage', function (data) {
    var message = data.message;
    var name = data.name;
    $('#messages').prepend('<b>' + name + '</b><br />' + message + '<hr />');
  });

  socket.on('error', function (reason) {
    console.log('Unable to connect to client', reason);
  });

  function sendMessage() {
    var outgoingMessage = $('#outgoingMessage').val();
    var name = $('#name').val();
    $.ajax({
      url: serverBaseUrl + '/message',
      type: 'POST',
      dataType: 'json',
      data: {message: outgoingMessage, name: name}
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
    socket.emit('nameChange', {id: sessionId, name: name});
  }

  $('#outgoingMessage').on('keydown', outgoingMessageKeyDown);
  $('#outgoingMessage').on('keyup', outgoingMessageKeyUp);

  $('#name').on('focusout', nameFocusOut);

  $('#send').on('click', sendMessage);
}

$(document).on('ready', init);
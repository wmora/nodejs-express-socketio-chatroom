function init() {
  var serverBaseUrl = 'http://localhost:3000';
  var socket = io.connect(serverBaseUrl);
  socket.on('incomingMessage', function(data) {
    var message = data.message;
    var sender = data.sender;
    console.log(data.message);
    $('#messages').append('<b>' + sender + ': </b>' + message + '<br>');
  });

  function sendMessage() {
    var outgoingMessage = $('#outgoingMessage').val();
    var sender = $('#name').val();
    console.log(outgoingMessage);
    $.ajax({
      url: serverBaseUrl + '/message',
      type: 'POST',
      dataType: 'json',
      data: {message: outgoingMessage, sender: sender}
    });
  }

  $('#outgoingMessage').on('keydown', function(event) {
    if (event.which == 13) {
      event.preventDefault();
      sendMessage();
      $('#outgoingMessage').val('');
    }
  });

  $('#send').on('click', sendMessage);
}

$(document).on('ready', init);

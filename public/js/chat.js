let sender = sessionStorage.getItem('SENDER');
let receiver = sessionStorage.getItem('RECEIVER');
let tableName = 'CHAT_';

//SET TABLE NAME
if (sender < receiver) {
  tableName += sender + receiver;
} else {
  tableName += receiver + sender;
}

function getMessagsFromFirebase() {
  if(tableName.indexOf('UNDEFINED') == -1 && tableName.indexOf('NULL') == -1){
    let firebaseDatabaseReference = firebase.database().ref('chat/' + tableName);
    let output = messages = divId = '';
    firebaseDatabaseReference.on('child_added', function(snapshot) {
      messages = snapshot.val();
      if (messages.username == sender) {
        divId = "sender-text";
      } else {
        divId = "receiver-text";
      }
      output += '<div id = ' + divId + ' class = "chat-text ' + messages.username + '">' + messages.message + '</div>';
      $('#chatbox').html(output);
      $("html, body").scrollTop($(document).height()-$(window).height());
    });
  }
}

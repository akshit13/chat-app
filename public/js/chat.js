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
  let firebaseDatabaseReference = firebase.database().ref(tableName);
  let output = messages = divClass = '';
  firebaseDatabaseReference.on('child_added', function(snapshot) {
    messages = snapshot.val();
    if (messages.username == sender) {
      divClass = "sender-text";
    } else {
      divClass = "receiver-text";
    }
    output += '<div id = ' + divClass + ' class = "chat-text ' + messages.username + '">' + messages.message + '</div>';
    $('#chatbox').html(output);
  });
}

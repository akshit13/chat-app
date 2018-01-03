let sender = sessionStorage.getItem('USERNAME');
let receiver = sessionStorage.getItem('USER2');
let tableName = 'TAB_';

if (sender < receiver) {
  tableName += sender + receiver;
} else {
  tableName += receiver + sender;
}

function getMessagsFromFirebase() {
  let firebaseDatabaseReference = firebase.database().ref(tableName);
  let output = msgs = divClass = '';
  firebaseDatabaseReference.on('child_added', function(snapshot) {
    msgs = snapshot.val();
    if (msgs.username == sender) {
      divClass = "sender-text";
    } else {
      divClass = "receiver-text";
    }
    output += '<div id = ' + divClass + ' class = "chat-text ' + msgs.username + '">' + msgs.msg + '</div>';
    $("#chatbox").html(output);
  });
}

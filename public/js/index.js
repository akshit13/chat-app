let chatTableArray = [],chatWindowStatus = false;

// RETURN REFERENCE TO 'users' COLLECTION
function usersReference() {
  return firebase.database().ref('users');
}

// ON LOGIN BUTTON CLICK
$('#btn-login').click(
  function() {
    let email = $('#text-email').val();
    let password = $('#text-password').val();

    if (email != "" && password != "") {
      firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        $('#login-error').show().text(error.message);
      });
    }
  }
)

// ON SIGNUP BUTTON CLICK
$('#btn-signup-two').click(
  function() {
    let username = $('#text-name').val();
    let email = $('#text-email').val();
    let password = $('#text-password').val();

    if (email != "" && password != "" && username != "") {
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        $('#login-error').show().text(error.message);
      });
      let user = firebase.auth().currentUser;
      if (user) {
        user.updateProfile({
          displayName: username
        })
      }
      addNewUserInFirebaseDB(username, email);
      updateUIAfterLogin(email);
    }
  }
)

// ON LOGOUT BUTTON CLICK
$('#btn-logout').click(
  function() {
    setUserStatus(false);
    firebase.auth().signOut().catch(function(error) {
      alert(error.message);
    });
    clearSessionStorage();
    location.reload();
  }
)

//SECONDARY BUTTONS ACTION
$('#btn-signup-one').click(
  function() {
    $('#name-space').show();
    $('#signup-btn-two').show();
    $('#login-btn-two').show();
    $('#login-btn-one').hide();
    $('#signup-btn-one').hide();
  }
)

$('#btn-login-two').click(
  function() {
    $('#name-space').hide();
    $('#signup-btn-two').hide();
    $('#login-btn-two').hide();
    $('#login-btn-one').show();
    $('#signup-btn-one').show();
  }
)

// ADD NEW USERS IN 'users' COLLECTION
function addNewUserInFirebaseDB(username, email) {
  let newUser = {
    username: username,
    email: email,
    isActive: true
  };
  usersReference().push().set(newUser);
  sessionStorage.setItem('SENDER', username);
  sessionStorage.setItem('SENDER-MAIL', email);
}

// SHOW/HIDE DIALOG
firebase.auth().onAuthStateChanged(function(user) {
  let loginDialog = document.querySelector('#login-dialog');
  if (!loginDialog.showModal) {
    dialogPolyfill.registerDialog(loginDialog);
  }
  if (user) {
    $('.login-cover').hide();
    loginDialog.close();
    updateUIAfterLogin(user.email);
  } else {
    $('.login-cover').show();
    loginDialog.showModal();
  }
})

// UPDATE UI AFTER SIGNIN
function updateUIAfterLogin(email) {
  sessionStorage.setItem('SENDER-MAIL', email);
  setUserStatus(true);
  getAndUpdateUsernameFromFirebaseDB(email);
  $('#email-area').text(email);
  getAndUpdateUsersFromFirebaseDB(email);
}

// GET AND UPDATE USERLIST IN NAVBAR FROM FIREBASE DB 'users'
function getAndUpdateUsersFromFirebaseDB(email) {
  let output = user = '';
  usersReference().on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email != email)
      output += '<button onclick="chatWindow(this.id, ' + user.isActive + ')" id="' + user.username + '" class="mdl-navigation__link"><i id="circle-' + user.username + '" class="material-icons status-' + user.isActive + '">account_circle</i> &nbsp;' + user.username + ' <i id="status-' + user.username + '" </button>';
    $('#active-users').html(output);
  });
}

// GET AND UPDATE USERNAME FROM FIREBASE DB 'users'
function getAndUpdateUsernameFromFirebaseDB(email) {
  usersReference().on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email == email) {
      sessionStorage.setItem('SENDER', user.username);
      $('#username-area').text(sessionStorage.getItem('SENDER'));
    }
  });
}

// USER ONLINE STATUS
function setUserStatus(status) {
  let email = sessionStorage.getItem('SENDER-MAIL');
  if (email) {
    usersReference().on('child_added', function(snapshot) {
      let parentKey = snapshot.key;
      let user = snapshot.val();
      if (user.email == email) {
        firebase.database().ref("/users/" + parentKey).update({
          isActive: status
        });
        //console.log(user.email + ' isActive set to ' + user.isActive);
      }
    });
  }
}


// POPULATE CHAT WINDOW
function chatWindow(receiver, status) {
  $('#chat-window').show();
  $('#chat-uname').text(receiver);
  //chage in css later
  if (status) {
    $("#chat-header").css({
      "background-color": "#55c50b"
    });
  } else {
    $("#chat-header").css({
      "background-color": "#000"
    });
  }

  let lastReceiver = sessionStorage.getItem('RECEIVER');

  if (receiver != lastReceiver || lastReceiver == null) {
    sessionStorage.setItem('RECEIVER', receiver);
    updateTableName(receiver);
  }
  if (!chatWindowStatus || (receiver != lastReceiver && chatWindowStatus)) {
    chatWindowStatus = true;
    document.getElementById('chat-frame').contentWindow.location.reload();
  }
}

// NOTIFY ON MESSAGE RECIEVE
firebase.database().ref('chat').on('value', function(snapshot) {
  let username = sessionStorage.getItem('SENDER');
  let tableName = snapshot.val();
  for (let key in tableName) {
    let count = 0;
    firebase.database().ref('chat/' + key).on('child_added', function(snapshot) {
      //msgR->totalMessageReceived
      let msgR = snapshot.val();
      count++;
      let receiver = sessionStorage.getItem('RECEIVER');
      if (msgR.username != username && key.indexOf(username) != -1 && chatTableArray[key] && count > chatTableArray[key]) {
        chatWindow(msgR.username, true);
      }
    });
    chatTableArray[key] = count;
  }
});

// HELPER FUNCTION TO UPDATE TABLE NAME FOR CHAT IN FIREBASE
let globalChatReference;

function updateTableName(receiver) {
  let sender = sessionStorage.getItem('SENDER');
  let tableName = 'CHAT_';
  if (sender < receiver) {
    tableName += sender + receiver;
  } else {
    tableName += receiver + sender;
  }
  globalChatReference = firebase.database().ref('chat/' + tableName);
}

// SEND NEW MESSAGE
$('#msg-form').submit(function(e) {
  e.preventDefault();
  let message = $('#chat-input').val();
  let newMessage = {
    username: sessionStorage.getItem('SENDER'),
    message: message
  };
  globalChatReference.push().set(newMessage);
  $('#chat-input').val('');
})

// CLOSE CHAT WINDOW
$('#btn-close').click(
  function() {
    $('#chat-window').hide();
    chatWindowStatus = false;
  }
)

// CLEAR SESSION STORAGE
function clearSessionStorage() {
  sessionStorage.clear();
}

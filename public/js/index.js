let usersReference = firebase.database().ref('users');

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
    firebase.auth().signOut().catch(function(error) {
      alert(error.message);
    });
    clearSession();
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
    email: email
  };
  usersReference.push().set(newUser);
  sessionStorage.setItem('SENDER', username);
  sessionStorage.setItem('USEREMAIL', email);
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

// UPDATE UI AFTER USER SIGNIN
function updateUIAfterLogin(email) {
  sessionStorage.setItem('USEREMAIL', email);
  getAndUpdateUsernameFromFirebaseDB(email);
  $('#email-area').text(email);
  getAndUpdateUsersFromFirebaseDB(email);
}

// GET AND UPDATE USERLIST FROM FIREBASE DB 'users'
function getAndUpdateUsersFromFirebaseDB(email) {
  let output = user = '';
  usersReference.on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email != email)
      output += '<button onclick="chatWindow(this)" id="' + user.username + '" class="mdl-navigation__link"><i class="material-icons">account_circle</i> &nbsp;' + user.username + '</button>';
    $('#active-users').html(output);
  });
}

// GET AND UPDATE USERNAME FROM FIREBASE DB 'users'
function getAndUpdateUsernameFromFirebaseDB(email) {
  usersReference.on('child_added', function(snapshot) {
    user = snapshot.val();
    if (user.email == email) {
      sessionStorage.setItem('SENDER', user.username);
      $('#username-area').text(sessionStorage.getItem('SENDER'));
    }
  });
}


// POPULATE CHAT WINDOW
function chatWindow(username) {
  $('#chat-window').show();
  $('#chat-uname').text(username.id);

  sessionStorage.removeItem('RECEIVER');
  sessionStorage.removeItem('TABLENAME');
  sessionStorage.setItem('RECEIVER', username.id);
  updateTableName(username.id);
  document.getElementById('chat-frame').contentWindow.location.reload();
}

// HELPER FUNCTION TO UPDATE TABLE NAME FOR CHAT
let globalChatReference;

function updateTableName(receiver) {
  let sender = sessionStorage.getItem('SENDER');
  let tableName = 'CHAT_';
  if (sender < receiver) {
    tableName += sender + receiver;
  } else {
    tableName += receiver + sender;
  }
  let chatRef = firebase.database().ref(tableName);
  globalChatReference = chatRef;
  sessionStorage.setItem('TABLENAME', tableName);
}

// SEND NEW MESSAGE
$('#msg-form').submit(function(e) {
  e.preventDefault();
  let sender = sessionStorage.getItem('SENDER');
  let message = $('#chat-input').val();
  let newMessage = {
    username: sender,
    message: message
  };
  globalChatReference.push().set(newMessage);
  $('#chat-input').val('');
})

// CLOSE CHAT WINDOW
$('#btn-close').click(
  function() {
    $('#chat-window').hide();
  }
)

// CLEAR/DELETE SESSION STORAGE
function clearSession() {
  sessionStorage.clear();
}

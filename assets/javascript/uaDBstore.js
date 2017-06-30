//User Authentication and database storage
//$(document).ready(function() {
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyDi2g588bcWLXFwdCjviNcxOLMGQapxjbU",
    authDomain: "food-paradise-8ef13.firebaseapp.com",
    databaseURL: "https://food-paradise-8ef13.firebaseio.com",
    projectId: "food-paradise-8ef13",
    storageBucket: "food-paradise-8ef13.appspot.com",
    messagingSenderId: "698241980106"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  //Get elements

  const txtEmail = document.getElementById("txtEmail");
  const txtPassword = document.getElementById("txtPassword");
  const btnLogin = document.getElementById("btnLogin");
  const btnSignUp = document.getElementById("btnSignUp");

  //add login event

  btnLogin.addEventListener("click", e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
    promise.catch(e => $(".errors").html(e.message));
  })

  //add signup event

  btnSignUp.addEventListener("click", e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
    promise.catch(e => $(".errors").html(e.message));
  });

  //add a realtime listener
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
      console.log(firebaseUser);
      console.log(firebaseUser.uid);
      $(".errors").html("You've successfully logged in");
    } else {
      console.log("not logged in")
      $(".errors").html("Log in or sign up");
    }
  })


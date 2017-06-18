//User Authentication and database storage
$(document).ready(function() {
  // Initialize Firebase
	var config = {
		apiKey: "AIzaSyDi2g588bcWLXFwdCjviNcxOLMGQapxjbU",
		authDomain: "food-paradise-8ef13.firebaseapp.com",
		databaseURL: "https://food-paradise-8ef13.firebaseio.com",
		projectId: "food-paradise-8ef13",
		storageBucket: "food-paradise-8ef13.appspot.com",
		messagingSenderId: "698241980106"
	};
	firebase.initializeApp(config);

	// FirebaseUI config.
      var uiConfig = {
        signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>'
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
	});
});
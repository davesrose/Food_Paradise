//User Authentication and database storage
//$(document).ready(function() {
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
        signInSuccessUrl: 'https://davesrose.github.io/Food_Paradise/',
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

  //User database additions
  var database = firebase.database();

  $(".save").on("click", function(event) {
    event.preventDefault();
    // If the on click is in the same function JS as the page generation, we can use recipeID there without having to pull it again from a source
    //recipeId = $("#train-name").val().trim();
    var saveFoodName = $()
    database.ref().push({
        recipeId: recipeId,
    });
   
   // Takes user to saved recipes.
   // Pulls data from the database to run the yummmly get recipe API and generate a list similar to propogating the search list but for each recipeID
  $("document").on("click", "div.mySaved", function(event) {
    event.preventDefault();
      // window.location.href = "savedRecipes.html" //not created yet
      var savedRecipe = childSnapshot.val().recipeId;
      var queryURL3 = "https://api.yummly.com/v1/api/recipe/"+savedRecipe+"?_app_id=069691a5&_app_key=3944fb993fe2cb009e5e6a5fd1e4facb"
      $.ajax({
        url: queryURL3,
        method: "GET"
      }).done(function(response) {
        var smallPic = response.images.hostedSmallUrl; //url for small picture to display
        var savedName = response.name; //Name of recipe
        // Make a variable (forked from David's barcode.js) to combine the picture, recipeID, and recipe name into one variable to later display
        var savedListings = ("<img src="smallPic"><div data-id='"+savedRecipe+"' class='recipeOption'><div class='recipeThumb'>" + savedName + "</div></div></div>");
        $(".savedRecipe").append(savedListings)

    }
  // On the addition of saved recipes to the database
  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
    var savedRecipe = childSnapshot.val().recipeID;
    var savedName = childSnapshot.val().recipeName;

  });
//});
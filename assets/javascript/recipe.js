$(document).ready(function(){
	$(".savedDialogue").hide(); //hide top layer that is used for alerting user of a saved recipe
	$(".recipeContainer").css({ //collapse the recipe list
		"overflow" : "hidden",
		height : 0
	});

	(function($) { //a function for creating a click toggle
	    $.fn.clickToggle = function(func1, func2) {
	        var funcs = [func1, func2];
	        this.data('toggleclicked', 0);
	        this.click(function() {
	            var data = $(this).data();
	            var tc = data.toggleclicked;
	            $.proxy(funcs[tc], this)();
	            data.toggleclicked = (tc + 1) % 2;
	        });
	        return this;
	    };
	}(jQuery));
	
	$('.accountRecipe h2,.accountRecipe .bottom,.accountRecipe .tab').clickToggle(function() { //click toggle for showing recipe list
	    $('.recipeContainer').animate({
    		height: $('.recipeContainer').get(0).scrollHeight
		}, 1000, function(){
    		$(this).height('auto');
		});
	},
	function() {
	    $(".recipeContainer").animate({
	        height: 0
	    }, 1000);
	});

	var recipeID = localStorage.getItem("recipeID"); //retrieve locally stored recipe ID variable (that was stored either by clicking a recipe link on index.html, or a recipe list)
	//ajax call query for yummly recipe ID
	var queryURL = "https://api.yummly.com/v1/api/recipe/"+recipeID+"?_app_id=069691a5&_app_key=3944fb993fe2cb009e5e6a5fd1e4facb"
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      console.log(queryURL);
      console.log(response);
      var recipeName = response.name;
      var servingNum = response.numberOfServings; //variable for number of servings
      var totalTime = response.totalTime;  //variable for total cooking time
      var rating = Math.round(response.rating); //user rating
      var img = response.images[0].hostedLargeUrl;  //get recipe's first image url
      for (var j = 0; j < response.nutritionEstimates.length; j++) {  //creating loop to find nutrition information in a flexible array
      	if (response.nutritionEstimates[j].description === "Potassium, K") {  //finding potassium value
      		var potassium = Math.round(response.nutritionEstimates[j].value*1000); //converting to milligrams
      	}
      	if (response.nutritionEstimates[j].description === "Protein") {  //finding protein value
      		var protein = Math.round(response.nutritionEstimates[j].value);
      	}      	
       	if (response.nutritionEstimates[j].description === "Total lipid (fat)") {  //finding fat value
      		var fat = Math.round(response.nutritionEstimates[j].value);
      	}  
       	if (response.nutritionEstimates[j].description === "Sodium, Na") {  //finding sodium value
      		var sodium = Math.round(response.nutritionEstimates[j].value*1000); // grams
      	}
       	if (response.nutritionEstimates[j].description === "Carbohydrate, by difference") {  //finding carbs value
      		var carbs = Math.round(response.nutritionEstimates[j].value);
      	}
        if (response.nutritionEstimates[j].description === "Fiber, total dietary") {  //finding fiber value
      		var fiber = Math.round(response.nutritionEstimates[j].value);
      	}
      }
      var cals = Math.round(9*fat+4*carbs+4*protein);
      var recipeSource = response.source.sourceRecipeUrl;
	  for (var i = 0; i < response.ingredientLines.length; i++) {
      	var ingredients = response.ingredientLines[i]
      	console.log(ingredients);
      	$(".recipeList > ul").append("<li>"+ingredients+"</li>")
      }
      $(".name").html(recipeName);
      $(".img").attr("src",img);
      $(".info").html("<div class='rate'><img src='assets/images/"+rating+"stars.png'></div><div class='time'>"+totalTime+"</div><div class='servings'>Serves: "+servingNum+"</div><div class'clear'></div>");
      $(".nutrition").html("<div class='nut' style='margin-right:3%; float: left;'>Calories:"+cals+"</div><div class'nut' style='margin-right:3%; float: left;'>Sodium:"+sodium+"mg</div><div class'nut' style='margin-right:3%; float: left;'>Carbs:"+carbs+"g</div><div class'nut' style='margin-right:3%; float: left;'>Fat:"+fat+"g</div><div class'nut' style='margin-right:3%; float: left;'>Protein:"+protein+"g</div><div class'nut' style='margin-right:3%; float: left;'>Fiber:"+fiber+"g</div><div class'nut' style='margin-right:3%; float: left;'>Potassium:"+potassium+"mg</div><div class='clear'></div>");
      $("#recipeModal").on("click", function() {
      		$(".directionsHTML").html("<iframe src='"+recipeSource+"'></iframe>");
  		});

      //view and generate recipe list
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
	  //add a realtime listener
	  firebase.auth().onAuthStateChanged(firebaseUser => {
	    if(firebaseUser) {
	      console.log(firebaseUser);
	      console.log(firebaseUser.uid)
	      $(".signin img").attr("src","assets/images/GoogleIconOut.png");
	        database.ref("/user/" + firebaseUser.uid).on("child_added", function(childSnapshot, prevChildKey) {
	          var key = childSnapshot.val();
	          var snap = childSnapshot.key;
	          // console.log(key);
	          var recipeLine = '<div class="recipe" id="'+key.recipeId+'" data-recipekey="'+snap+'"><span>'+key.recipeName+'</span><button type="submit" class="btn btn-default remove" data-recipekey="'+snap+'">-</button></div><div class="line"></div>';
	          // console.log(recipeLine);
	          $(".recipeContainer").append(recipeLine);

	  		$(".recipe span").on("click", function() {
			  	var recipeID = $(this).parent().attr("id");
				localStorage.setItem("recipeID", recipeID);
				console.log(localStorage.getItem("recipeID"));
				window.location.href = "recipe.html";
			  });


	          $(".remove").on("click", function(childSnapshot) {
	          	var recipeRemove = $(this).parent().attr("id");
	          	if (recipeRemove === key.recipeId) {
	          		database.ref("/user/" + firebaseUser.uid+"/"+snap).remove();
	          		$(this).parent().next(".line").remove();
	          		$(this).parent().remove();
	          	};
	          });

	        });
	        if (firebaseUser !== null) {
				$(".signin").on("click", function() {
					firebase.auth().signOut();
				});
				$("#signIn_box").modal("hide");
			}
	    } else {
		    if (firebaseUser === null) {
				$(".signin").on("click", function() {
					$("#signIn_box").modal("show");
				});
				$("#signIn_box").modal("hide");
			};
	    	$(".signin img").attr("src","assets/images/GoogleIcon.png");
	    	$(".line").remove();
	    	$(".recipeContainer .recipe").remove();
	    }
	  })

	  //push new recipe key or open sign in modal if user hasn't signed in yet
	  var duplicate = false; //variable for checking recipeId duplicates
    $(".save").on("click", function(firebaseUser) {
	      event.preventDefault();
	  firebase.auth().onAuthStateChanged(firebaseUser => { //firebase authentication state
	    if(firebaseUser) { //if signed in
	        database.ref("/user/" + firebaseUser.uid).on("child_added", function(childSnapshot, prevChildKey) { //go to user's database folder
	          var key = childSnapshot.val(); //get key objects
    			if (key.recipeId === recipeID) { //if the recipe's ID is the same as a database recipeId, make duplicate true
    				duplicate = true;
	  			} else {
	  				duplicate = false;				
	  			}
			});
			if (duplicate === true) { //if there is a duplicate, alert that it's already saved
				$(".savedDialogue div").html("recipe already saved")
				$(".savedDialogue").fadeIn(500).delay(1000).fadeOut(500);				
			} else {
	      		database.ref("/user/" + firebaseUser.uid).push({  //else, push new recipe ID and recipe name to user directory
	          		recipeId: recipeID,
	          		recipeName: recipeName
	      		});
				$(".savedDialogue div").html(recipeName+" saved")  //alert that recipe name has been saved
				$(".savedDialogue").fadeIn(500).delay(1000).fadeOut(500);
			}

		  } else {
		  	$("#signIn_box").modal("show"); //if user hasn't been signed in, bring up sign in modal
		  }
	  	});
	});

	if (screen.width > 720) {
		$(".barcodeScanner button").html("Barcode Scanner");
		$(".signin img").css({
			width : "80%",
			"margin-left" : "10%",
			"margin-top" : "5%"
		});
	} else {
		$(".barcodeScanner button").html("Scan");
		$(".signin img").css({
			width : "100%",
			"margin-left" : "0px",
			"margin-top" : "0px"
		});
	}

    });
});
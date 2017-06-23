$(document).ready(function(){
	$(".recipeContainer").css({
		"overflow" : "hidden",
		height : 0
	});

	(function($) {
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
	
	$('.accountRecipe h2,.accountRecipe .bottom,.accountRecipe .tab').clickToggle(function() {   
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

	// var recipeID = "Golden-Raisin-Rosemary-Oatmeal-Cookies-1785227"
	var recipeID = localStorage.getItem("recipeID");
	var queryURL = "https://api.yummly.com/v1/api/recipe/"+recipeID+"?_app_id=069691a5&_app_key=3944fb993fe2cb009e5e6a5fd1e4facb"
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      console.log(queryURL);
      console.log(response);
      var recipeName = response.name;
      var servingNum = response.numberOfServings;
      var totalTime = response.totalTime;
      var rating = Math.round(response.rating);
      var img = response.images[0].hostedLargeUrl;
      for (var j = 0; j < response.nutritionEstimates.length; j++) {
      	if (response.nutritionEstimates[j].description === "Potassium, K") {
      		var potassium = Math.round(response.nutritionEstimates[j].value*1000);
      	}
      	if (response.nutritionEstimates[j].description === "Protein") {
      		var protein = Math.round(response.nutritionEstimates[j].value);
      	}      	
       	if (response.nutritionEstimates[j].description === "Total lipid (fat)") {
      		var fat = Math.round(response.nutritionEstimates[j].value);
      	}  
       	if (response.nutritionEstimates[j].description === "Sodium, Na") {
      		var sodium = Math.round(response.nutritionEstimates[j].value*1000); // grams
      	}
       	if (response.nutritionEstimates[j].description === "Carbohydrate, by difference") {
      		var carbs = Math.round(response.nutritionEstimates[j].value);
      	}
        if (response.nutritionEstimates[j].description === "Fiber, total dietary") {
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
      $(".recipeContainer").empty()

  var config = {
    apiKey: "AIzaSyDi2g588bcWLXFwdCjviNcxOLMGQapxjbU",
    authDomain: "food-paradise-8ef13.firebaseapp.com",
    databaseURL: "https://food-paradise-8ef13.firebaseio.com",
    projectId: "food-paradise-8ef13",
    storageBucket: "food-paradise-8ef13.appspot.com",
    messagingSenderId: "698241980106"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
	  $(".save").on("click", function(event) {
	    event.preventDefault();
      //Build array of recipeIDs from DB
      for (var i = Things.length - 1; i >= 0; i--) {
        Things[i]
              var recall_name = childSnapshot.val().recipeID;
      }

      if (recall_name != recipeID) {
	    database.ref().push({
	        recipeId: recipeID,
	        recipeName: recipeName
	    });
	    console.log("recipe ID: "+recipeID+" recipe Name: "+recipeName);
	    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
	    	event.preventDefault();
	    	var savedRecipe = childSnapshot.val().recipeID;
	    	var savedName = childSnapshot.val().recipeName;

	    	$(".recipeContainer").append('<div class="recipe">'+savedName+'<button type="submit" class="btn btn-default">-</button></div>');
	    })
	});

      console.log("Cals: "+cals+" sodium: "+sodium+" fat: "+fat+" carbs: "+carbs+" protein: "+protein+" potassium: "+potassium);
    });
});
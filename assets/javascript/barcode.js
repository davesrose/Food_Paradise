$(document).ready(function(){
	$(".nutritionix").hide();  //nutrionix line displays food item name, and is initially hidden
	$(".foodInput").css({  //collapse the food item input container
		"overflow" : "hidden",
		height : 0
	});
	$(".recipeContainer").css({  //collapse the recipe container div
		"overflow" : "hidden",
		height : 0
	});
	(function($) {  //create a toggle click function
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

	$('.foodInputCon h2,.foodInputCon .bottom,.foodInputCon .tab').clickToggle(function() { //toggle click display food input container
	    $('.foodInput').animate({
    		height: $('.foodInput').get(0).scrollHeight
		}, 1000, function(){
    		$(this).height('auto');
		});
	},
	function() {
	    $(".foodInput").animate({
	        "height": "0px"
	    }, 1000);
	});
	$('.accountRecipe h2,.accountRecipe .bottom,.accountRecipe .tab').clickToggle(function() { //toggle click display recipe container 
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
	if (localStorage.getItem("foodName") !== null) { //if coming back from another page, keep food name and run yummly query
		var foodName = localStorage.getItem("foodName");
		yummlyResponse(foodName);
	}
	$(function() { //script for the QuaggaJS barcode scanning software
		// Create the QuaggaJS config object for the live stream, interactive scanner
		var liveStreamConfig = {
				inputStream: {
					type : "LiveStream",
					constraints: {
						width: {min: 640},
						height: {min: 480},
						aspectRatio: {min: 1, max: 100},
						facingMode: "environment" // or "user" for the front camera
					}
				},
				locator: {
					patchSize: "medium",
					halfSample: true
				},
				numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4),
				decoder: {
					"readers":[
						{"format":"ean_reader","config":{}}
					]
				},
				locate: true
			};
		// The fallback to the file API requires a different inputStream option. 
		// The rest is the same 
		var fileConfig = $.extend(
				{}, 
				liveStreamConfig,
				{
					inputStream: {
						size: 800
					}
				}
			);
		// Start the live stream scanner when the modal opens
		$('#livestream_scanner').on('shown.bs.modal', function (e) {
			Quagga.init(
				liveStreamConfig, 
				function(err) {
					if (err) {
						$("#interactive").hide();
						if (err.name === "DevicesNotFoundError") {
							$('#livestream_scanner .modal-body .error').html("Camera not found.  Press 'Use camera app' button to find a photo of a barcode.")
						} else if (err.message === "getUserMedia is not defined") {
							$('#livestream_scanner .modal-body .error').html("Press 'Use camera app' to grab a bardcode from your phone's camera");
						} else {
							$('#livestream_scanner .modal-body .error').html('<div class="alert alert-danger"><strong><i class="fa fa-exclamation-triangle"></i> '+err.name+'</strong>: '+err.message+'</div>');
						}
						Quagga.stop();
						return;
					}
					Quagga.start();
				}
			);
	    });
		
		// Make sure, QuaggaJS draws frames an lines around possible 
		// barcodes on the live stream
		Quagga.onProcessed(function(result) {
			var drawingCtx = Quagga.canvas.ctx.overlay,
				drawingCanvas = Quagga.canvas.dom.overlay;
	 
			if (result) {
				if (result.boxes) {
					drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
					result.boxes.filter(function (box) {
						return box !== result.box;
					}).forEach(function (box) {
						Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
					});
				}
	 
				if (result.box) {
					Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
				}
	 
				if (result.codeResult && result.codeResult.code) {
					Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
				}
			}
		});
		
		// Once a barcode had been read successfully, stop quagga and 
		// close the modal after a second to let the user notice where 
		// the barcode had actually been found.
		Quagga.onDetected(function(result) {    		
			if (result.codeResult.code){
				$('#scanner_input').val(result.codeResult.code);
				Quagga.stop();	
				setTimeout(function(){ $('#livestream_scanner').modal('hide'); }, 1000);
				var UPC = result.codeResult.code;
				getIDs(UPC);			
			}
		});
	    
		// Stop quagga in any case, when the modal is closed
	    $('#livestream_scanner').on('hide.bs.modal', function(){
	    	if (Quagga){
	    		Quagga.stop();	
	    	}
	    });
		
		// Call Quagga.decodeSingle() for every file selected in the 
		// file input
		$("#livestream_scanner input:file").on("change", function(e) {
			if (e.target.files && e.target.files.length) {
				Quagga.decodeSingle($.extend({}, fileConfig, {src: URL.createObjectURL(e.target.files[0])}), function(result) {alert(result.codeResult.code);});
				var UPC = result.codeResult.code;
				getIDs(UPC);
			}
		});
	});	
	function getIDs(UPC) {  //function for looking up UPC code with nutritionix
		// make query with UPC code in nutritionix
		var queryURL = "https://api.nutritionix.com/v1_1/item?upc="+UPC+"&appId=af71ef2f&appKey=64be45970143817635f29340426218f7";
	    $.ajax({
	      url: queryURL,
	      method: "GET"
	    }).done(function(response) {
	      console.log(queryURL);
	      console.log(response);
			$(".foodInput").animate({ //after inputting food, animate tab to collapse
				"height": "0px"
			}, 1400);
	      var foodName = response.item_name.replace(/,/g , '');  //get food name item from item_name response
		$(".nutritionix").show(); //show line for user to see the food item found
	      $(".foodID").html("Food Name: " + foodName); //show food item
	      localStorage.setItem("foodName",foodName); // set food item in local storage
	      yummlyResponse(foodName); //run yummly query function with food name
	    }).fail(function (jqXHR, textStatus, errorThrown) { //if nutritionix response doesn't return value
	    	$(".nutritionix").show();
	    	$(".foodID").html("Food not found. Try typing in or scanning another."); //show food item line with food not found
	    	var foodName = "";
	    	localStorage.setItem("foodName",foodName); //set food name as empty

	    	$(".yummlyRecipes").empty();  //clear any previous yummply returns
			$(".foodInput").animate({  //collapse food input tab
				"height": "0px"
			}, 1400);
	    });
	}
	function yummlyResponse(foodName) { //function for querying yummly recipes
		$(".yummlyRecipes").empty(); //clear previous yummly returns
		//query yummly api for recipes
		var queryURL2 = "https://api.yummly.com/v1/api/recipes?_app_id=069691a5&_app_key=3944fb993fe2cb009e5e6a5fd1e4facb&q="+foodName+"&requirePictures=true&maxResult=10&start=10"
	    $.ajax({
	      url: queryURL2,
	      method: "GET"
	    }).done(function(response) {
	      // console.log(queryURL2);
	      // console.log(response);
	      if (response.matches.length === 0) { //this is rare, but if no response, return no recipes found
	      	$(".yummlyRecipes").html("<div class='noRecipes'>No Recipes Found</div>")
	      }
	      for (var i = 0; i < response.matches.length; i++) {  //response returns array, and we set variables for each item
	      	var foodItems = response.matches[i].id;  //recipe ID item
	      	var recipeName = response.matches[i].recipeName;  //recipe name item
	      	var thumbnail = response.matches[i].smallImageUrls[0]; //thumbnail image
	      	var rating = response.matches[i].rating;  //recipe rating
	      	var source = response.matches[i].sourceDisplayName;  //the source website name
	      	var foodListings = ("<div data-id='"+foodItems+"' class='recipeOption'><div class='recipeThumb'><img src='"+thumbnail+"'><div class'recipeInfo'><div class='top'>" + recipeName + "</div><div class='recipeBottom'>"+rating+"/5<span class='source'>&emsp;Source: "+source+"</span></div></div><div style='clear: left;'></div></div></div>"); //create recipe line with thumbnail image, recipe name, rating, and source
	      	$(".yummlyRecipes").append(foodListings); //append recipe links with yummly element
	      }
	    });
	}
	$(document).on("click", "div.recipeOption" , function() { //on click of recipe line
		var recipeID = $(this).data("id"); //recipe ID is id of recipe line div
		// console.log(recipeID);
		localStorage.setItem("recipeID", recipeID); //local storage of recipe ID
		// console.log(localStorage.getItem("recipeID"));
		window.location.href = "http://food-paradise.herokuapp.com/recipe.html"; //open recipe.html, now that recipe ID is stored
	});
	$("#foodSubmit").on("click", function() {  //food item input for input text instead of barcode
		$(".nutritionix").show(); //show food item line
		var foodName = $("#food-input").val().replace(/,/g , ''); //show food name value, take out any commas
	    $(".foodID").html("Food Name: " + foodName); //list food name entered
	    localStorage.setItem("foodName",foodName); //local storage of food name
	    yummlyResponse(foodName); //run yummly response of food item input
	});

	   const config = {  //initialize firebase API for recipe sign in
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
	  firebase.auth().onAuthStateChanged(firebaseUser => { //user sign in state
	    if(firebaseUser) { //if user is signed in
	      // console.log(firebaseUser);
	      // console.log(firebaseUser.uid)
	      
	        database.ref("/user/" + firebaseUser.uid).on("child_added", function(childSnapshot, prevChildKey) { //user database listener
	          var key = childSnapshot.val(); //key variable for recipe object
	          var snap = childSnapshot.key; //variable for storing recipe ID
	          var recipeLine = '<div class="recipe" id="'+key.recipeId+'"><span>'+key.recipeName+'</span><button type="submit" class="btn btn-default remove">-</button></div><div class="line"></div>'; //generate recipe line
	          $(".recipeContainer").append(recipeLine); //append recipe lines to container

			  $(".recipe span").on("click", function() { //on click, store recipe ID and go to recipe.html
			  	var recipeID = $(this).parent().attr("id");
				localStorage.setItem("recipeID", recipeID);
				// console.log(localStorage.getItem("recipeID"));
				window.location.href = "http://food-paradise.herokuapp.com/recipe.html";
			  });


	          $(".remove").on("click", function(childSnapshot) { //on click, remove this recipe line from page and firebase
	          	var recipeRemove = $(this).parent().attr("id"); //get recipe variable from recipe id attribute
	          	if (recipeRemove === key.recipeId) { //if local recipe Id is equal to a firebase recipe key id
	          		database.ref("/user/" + firebaseUser.uid+"/"+snap).remove(); //remove recipe value from firebase
	          		$(this).parent().next(".line").remove(); //remove recipe line div
	          		$(this).parent().remove(); //remove recipe line
	          	}; //end if
	          }); //end on click

	        }); //end user database listener
	        $(".signin img").attr("src","assets/images/GoogleIconOut.png");  //when user signed in, make sign in graphic show sign out
	        if (firebaseUser !== null) {  //if user is signed in
				$(".signin").on("click", function() { //on sign in click
					firebase.auth().signOut(); //sign user out
				}); //end if
				$("#signIn_box").modal("hide"); //make sure sign in modal doesn't open for other events
			}
	    } else { //else user isn't signed in
		    if (firebaseUser === null) { //if user isn't signed in
				$(".signin").on("click", function() { //on click sign in
					$("#signIn_box").modal("show"); //show sign in modal
				});
				$("#signIn_box").modal("hide"); //for other events, don't show sign in modal
			}; //end if
	    	$(".line").remove(); //when signed out, remove lines under recipes
	    	$(".recipeContainer .recipe").remove(); //when signed out, remove recipe entries
	    	$(".signin img").attr("src","assets/images/GoogleIcon.png"); //change sign in graphic to sign in
	    } //end else
	  }) //end firebase authentication

}); //end document load
$(document).ready(function(){
	// $(".yummlyRecipes .recipeOption").hide();
	$(".nutritionix").hide();
	$(".foodInput").css({
		"overflow" : "hidden",
		height : 0
	});
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
	$('.foodInputCon h2,.foodInputCon .bottom,.foodInputCon .tab').clickToggle(function() {   
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
	$('.account h2,.account .bottom,.account .tab').clickToggle(function() {   
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
	if (localStorage.getItem("foodName") !== null) {
		var foodName = localStorage.getItem("foodName");
		yummlyResponse(foodName);
	}
	$(function() {
		// Create the QuaggaJS config object for the live stream
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
	function getIDs(UPC) {
		$(".barcodeNum").html("UPC: " + UPC);
		var queryURL = "https://api.nutritionix.com/v1_1/item?upc="+UPC+"&appId=af71ef2f&appKey=64be45970143817635f29340426218f7";
	    $.ajax({
	      url: queryURL,
	      method: "GET"
	    }).done(function(response) {
	      console.log(queryURL);
	      console.log(response);
			$(".foodInput").animate({
				"height": "0px"
			}, 1400);
	      var foodName = response.item_name.replace(/,/g , '');;
		$(".nutritionix").show();
	      $(".foodID").html("Food Name: " + foodName);
	      localStorage.setItem("foodName",foodName);
	      yummlyResponse(foodName);
	    }).fail(function (jqXHR, textStatus, errorThrown) {
	    	$(".nutritionix").show();
	    	$(".foodID").html("Food not found. Try typing in or scanning another.");
	    	var foodName = "";
	    	localStorage.setItem("foodName",foodName);
	    	$(".yummlyRecipes").empty();
			$(".foodInput").animate({
				"height": "0px"
			}, 1400);
	    });
	}
	function yummlyResponse(foodName) {
		$(".yummlyRecipes").empty();
		var queryURL2 = "https://api.yummly.com/v1/api/recipes?_app_id=069691a5&_app_key=3944fb993fe2cb009e5e6a5fd1e4facb&q="+foodName+"&requirePictures=true&maxResult=10&start=10"
	    $.ajax({
	      url: queryURL2,
	      method: "GET"
	    }).done(function(response) {
	      console.log(queryURL2);
	      console.log(response);
	      if (response.matches.length === 0) {
	      	$(".yummlyRecipes").html("<div class='noRecipes'>No Recipes Found</div>")
	      }
	      for (var i = 0; i < response.matches.length; i++) {
	      	var foodItems = response.matches[i].id;
	      	var recipeName = response.matches[i].recipeName;
	      	var thumbnail = response.matches[i].smallImageUrls[0];
	      	var rating = response.matches[i].rating;
	      	var source = response.matches[i].sourceDisplayName;
	      	var foodListings = ("<div data-id='"+foodItems+"' class='recipeOption'><div class='recipeThumb'><img src='"+thumbnail+"'><div class'recipeInfo'><div class='top'>" + recipeName + "</div><div class='recipeBottom'>"+rating+" out of 5<span class='source'>&emsp;Source: "+source+"</span></div></div><div style='clear: left;'></div></div></div>");
	      	$(".yummlyRecipes").append(foodListings);
	      }
	    });
	}
	$(document).on("click", "div.recipeOption" , function() {
		var recipeID = $(this).data("id");
		console.log(recipeID);
		localStorage.setItem("recipeID", recipeID);
		console.log(localStorage.getItem("recipeID"));
		window.location.href = "recipe.html";
	});
	$("#foodSubmit").on("click", function() {
		$(".nutritionix").show();
		var foodName = $("#food-input").val().replace(/,/g , '');
	    $(".foodID").html("Food Name: " + foodName);
	    localStorage.setItem("foodName",foodName);
	    yummlyResponse(foodName);
	});
	$(".signin").on("click", function() {
		$("#signIn_box").modal("show");
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

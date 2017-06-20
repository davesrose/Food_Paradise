//Recipte Display jscript
$(document).ready(function() {

	$(".recipeOption").on("click", function() {
	var recipeID = $(this).attr("id").val();
	localStorage.setItem("recipeID", recipeID);

	});
});
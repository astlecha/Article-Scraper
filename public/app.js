// Gets json-version of articles & appends to the page
$.getJSON("/all", function(data) {
	for (var i = 0; i < data.length; i++) {
		newDiv = $("<div>").addClass("article "+data[i]._id);
		$("#allArticles").append(newDiv + "<h3>"+data[i].title+"</h3><hr><p>"+data[i].link+"</p>");
	}
});

// Adds new note to article specified
$(".noteButton").on("click", function() {
	//Send a popup where user types a note
	//Append the note into the popup (make sure they can add multiple notes)
});

// $(".deleteButton").on("click", function() {})

// $("#scrape-button").on("click", function() {})
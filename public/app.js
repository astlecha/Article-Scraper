// // Gets json-version of articles & appends to the page
// $.getJSON("/all", function(data) {
// 	for (var i = 0; i < data.length; i++) {
// 		// Appends new div with buttons for each article
// 		$("#allArticles").append("<div data-id='"+data[i]._id+"'>"
// 			+"<h3>"+data[i].title+"</h3><hr><p>"+data[i].link+"</p><br>"
// 			+"<button class='noteButton'>"+Add Note+"</button>"
// 			+"<button class='deleteButton'>"+Delete Article+"</button>");
// 	}
// });

// // Adds new note to article specified
// $(".noteButton").on("click", function() {
// 	// Send a popup where user types a note
// 	// Append the note into the popup (make sure they can add multiple notes)
// });

// $(".deleteButton").on("click", function() {})

// $("#scrape-button").on("click", function() {})
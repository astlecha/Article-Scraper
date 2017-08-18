app.get("/", function(req, res) {
	Article.find({})
	.exec(function(error, found) {
	    if (error) {
	      console.log(error);
	    }
	    else {
	      // alert("Found "+found.length+" new articles.");
		var results = { articles : found }
	      res.render("index", results);
	    }
	});
});

// Scrape data from the New York Times
app.get("/scrape", function(req, res){
	request("http://www.echojs.com/", function(error, response, html) {

		var $ = cheerio.load(html);

		$("article h2").each(function(i, element) {
		  // Empty object to put data into	
	      var result = {};

	      result.title = $(this).children("a").text();
      	  result.link = $(this).children("a").attr("href");

      	  // Create a new entry and save to the db
      	  var entry = new Article(result);
	        entry.save(function(err, doc) {
	          if (err) {
	            console.log(err);
	          }
	          else {
	            console.log(doc);
	          }
	  	    });
		});
	// Send browser back to root directory
	res.redirect("/");
	console.log("Scrape successful.")
  });
});

// Send new comment to the browser
app.post("/notes/:id", function(req, res) {

  // Create a new note/comment and save to the db
  var userComment = new Note(req.body);

  userComment.save(function(error, doc) {
    if (error) {
      res.send(error);
    }
    else {
      res.send(doc);

      // Find article with same id and insert new note
      Article.findOneAndUpdate({
      	"_id" : req.params.id
      },
      	{$push: { "note": doc._id }}, {new : true}, function(err, doc) {
      		if(err) {
      			console.log(err);
      		} else {
      			console.log("New note: ", doc);
      			res.redirect("/notes/"+req.params.id);
      		}
      })
  	}
  });
});

// Display the comments
app.get("/notes/:id", function(req, res) {
	console.log("note id: ", req.params.id);
	// Find article with matching id
	Article.find({ "_id" : req.params.id })
	// Populate the note and execute query
	.populate("note")
	.exec(function(error, doc) {
	    if (error) {
	      console.log(error);
	    }
	    else {
	      res.json(doc);
		}
	});
});

// Delete a comment
app.get("/delete/:id", function(req, res) {
	Note.remove({ "_id" : req.params.id })
	.exec(function(error, doc) {
		if(error) {
			console.log(error);
		}
		else {
			console.log("'" + doc.body.title + "' comment deleted");
			res.redirect("/");
		}
	});
});
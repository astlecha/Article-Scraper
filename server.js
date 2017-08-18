// Requires dependencies
var express = require("express");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Morgan logs server nd db interactions
var logger = require("morgan");

// Require request and cheerio for scraping
var request = require("request");
var cheerio = require("cheerio");

// Route the models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initializes express
var app = express();

// Use body parser & morgan with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make views a static dir
app.use(express.static("views"));

app.engine("handlebars", expressHandlebars({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//-----------Define Local MongoDB URI-------------
var databaseUri = "mongodb://localhost/scraped-websites";

// Database configuration with mongoose
if (process.env.MONGODB_URI) {
	// HEROKU EXECUTION
	mongoose.connect(process.env.MONGODB_URI);
} 
else {
	// LOCAL MACHINE EXECUTION
	mongoose.connect(databaseUri);
}

var db = mongoose.connection;

db.on("error", function(err) {
	console.log('Mongoose error: ', err);
});

db.once("open", function() {
	console.log("Mongoose connection successful.");
});

//===========================================
//Routes
//===========================================

// app.get("/", function(req, res) {
// 	res.render("index");
// });

app.get("/", function(req, res) {
	// Find all and append
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

app.get("/scrape", function(req, res) {
	Article.remove({})
	.exec(function(error, removed) {
		if(error){
			console.log(error);
		} else {
			console.log("Cleared articles from the DB");
			res.redirect("/scraped");
		}
	})
})

// Scrape data from the New York Times
app.get("/scraped", function(req, res){

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
	          // else {
	            // console.log(doc);
	          // }
	  	    });
		});
	// Send browser back to root directory
	res.redirect("/");
	console.log("Scrape successful!")
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
	      console.log("Note populated: ", doc);
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

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
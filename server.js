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

app.get("/", function(req, res) {

	res.render("index");
})

// Scrape data from the New York Times
app.get("/scrape", function(req, res){
	request("http://www.echojs.com/", function(error, response, html) {

		var $ = cheerio.load(html);

		$("article h2").each(function(i, element) {
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
	});
	// Send browser back to root directory
	 Article.find({}, function(error, found) {
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

// Retrieve all data from the scrapedData collection and send it to the browser
app.get("/articles", function(req, res) {
  Article.find({}, function(error, found) {
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

// Retrieve data from one article in the scrapedData collection & send to browser
//might need api routes folder with router.post
app.get("/api/articles/:id", function(req, res) {
	Article.findOneAndUpdate({ "_id": req.params.id }
		// , {$inc: { "note": res.body}}
		)
	//Populate the note and execute query
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

// Send new comment to the browser
app.post("/articles/:id", function(req, res) {

  var userComment = new Note(req.body);

  userComment.save(function(error, doc) {
    if (error) {
      res.send(error);
    }
    else {
      res.send(doc);
    }
  });
});

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
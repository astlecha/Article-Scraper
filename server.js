// Requires dependencies
var express = require("express");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");
var mongojs = require("mongojs");
var mongoose = require("mongoose");

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

// Use body parser with our app
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make views a static dir
app.use(express.static("views"));

app.engine("handlebars", expressHandlebars({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scraped");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Configures database
var databaseUrl = "scraped";
var collections = ["scrapedData"];

app.get("/", function(req, res) {
	res.render("index")
})

// Scrape data from the New York Times
app.get("/scrape", function(req, res){
	request("http://nytimes.com/", function(error, response, html) {

	  var $ = cheerio.load(html);

	  $("h2").each(function(i, element) {
	    var title = $(element).text();
	    var link = $(element).children().attr("href");
	    var obj = {
	    	title: title, 
	    	link: link
	    }
	    // Pass obj to entry
	    var entry = new Article(obj);
	    // Save new entry to the db
	    entry.save(function(err, doc) {
	    	if (err) {
          		console.log(err);
        	}
        	else {
          		console.log(doc);
        	}
	    });
	  });

	  res.send("/");
	});
});


app.get("/all", function(req, res) {
  // Find all in the scrapedData collection and send "found" result to the browser
  Article.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      alert("Found "+found.length+" new articles.");
      res.json(found);
    }
  });
});


// 	app.get("/", function(req, res) {
// 		//Delete this article from the database
// 		db.scrapedData.remove({id: this.id})
// 	})


app.get("/articles/:id", function(req, res) {

	Article.findOne({ "_id": req.params.id })
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

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
// Requires dependencies
var express = require("express");
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

// Configures database
var databaseUrl = "scraped";
var collections = ["scrapedData"];

// Hooks mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error){
	console.log("Database Error: ", error);
});

app.get("/", function(req, res) {
	console.log(res);
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
	    db.scrapedData.insert(obj);
	    console.log("object", obj);
	  });

	  res.send("/");
	});
});

// $("#scrape-button").on("click", function() {
// 	app.get("/all", function(req, res) {
// 	  // Find all in the scrapedData collection and send "found" result to the browser
// 	  db.scrapedData.find({}, function(error, found) {
// 	    if (error) {
// 	      console.log(error);
// 	    }
// 	    else {
// 	      alert("Found "+found.length+" new articles.");
// 	      res.json(found);
// 	      //Here we will append a new div for each article heading with article notes & delete buttons
// 	    }
// 	  });
// 	});
// });

// $(".deleteButton").on("click", function() {
// 	app.get("/", function(req, res) {
// 		//Delete this article from the database
// 		db.scrapedData.remove({id: this.id})
// 	})
// });

// $(".noteButton").on("click", function() {
// 	app.get("/", function(req, res) {
// 		//Send a popup where user types a note
// 		//Append the note into the popup (make sure they can add multiple notes)

// 		//Update this article in the database with your new note
// 		// db.scrapedData.update({id: this.id}, {$set {"note": $("#added-note")}})
// 	})
// });

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
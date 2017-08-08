// Requires dependencies
var express = require("express");
var mongojs = require("mongojs");

// Require request and cheerio for scraping
var request = require("request");
var cheerio = require("cheerio");

// Initializes express
var app = express();

// Configures database
var databaseUrl = "scraped";
var collections = ["scrapedData"];

// Hooks mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error){
	console.log("Database Error:", error);
});

app.get("/", function(req, res) {
	console.log(res);
})

app.get("/all", function(req, res) {
  // Find all in the scrapedData collection and send "found" result to the browser
  db.scrapedData.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

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
	    console.log('object', obj);
	  });

	  res.send('Scrape Complete!');
	});
});

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
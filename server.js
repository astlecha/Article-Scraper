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
	console.log(res)
})
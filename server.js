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
});

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
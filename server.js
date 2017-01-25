console.log("This code is designed to present to run on localhost/bluemix/heroku with the relevant hostname:port");
console.log("./routes/server_nodejs/platform.js: to set specific values such as bluemix url etc.");

var host_uri = "localhost"; // 

var express = require('express');
var fs = require('fs');  // for certs
var os = require('os');
var https = require('https'); 
var http  = require('http');  
var platform = require('./routes/server_nodejs/platform.js');
var runtime = platform.configure(); 
var secrets  = require('./secrets.js');  

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

//console.log(secrets.mongodb.connectionStr());
 
var myCollection;

var mDB;

//mDB = secrets.mongodb.connectionStr();
mDB = secrets.mongodb.connectionStrLocalhost();

// could move the connect string settings to secrets
var db = MongoClient.connect(mDB, function(err, db) {
    if(err)
        throw err;
    console.log("connected to the mongoDB at: " + runtime.mongodb);
	
	myCollection = db.collection('students'); // creates the collection if it does not exist
 
});
 
// you can research all the commented out features and 'npm install --save' as required

var compression = require('compression');

var toobusy = require('toobusy-js'); 
 
//var path = require('path');
//var logger = require('morgan');
var bodyParser = require('body-parser'); 
 
 
//var bluemix = require("./routes/middlewares/bluemix.js"); // force https

var helmet = require('helmet');
 
var connectionListener = false;
 
var app = express();
 
app.use(compression()); // must be first, GZIP all assets https://www.sitepoint.com/5-easy-performance-tweaks-node-js-express/
                                    // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(helmet()); // by default - removes:  ; adds: X-Frame-Options:SAMEORIGIN
				
// middleware which blocks requests when we're too busy 
app.use(function(req, res, next) {  // HAS TO BE FIRST 
  if (toobusy()) {
     res.status(503).send("<p><p>&nbsp&nbsp<h1>The server is busy, please try later, possibly in about 30 seconds.</h1>");
  } else {
    next();
  }
});

console.log(runtime);
	
if (runtime.isLocalHost) {  
 // windows if openssl installed
 // set OPENSSL_CONF=C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.cfg
 // C:\Program Files (x86)\OpenSSL-Win32\bin\openssl genrsa -out test-key.pem 1024

// test ssl keys with openssl installed - Google for your platform  https://www.openssl.org/
// openssl genrsa -out test-key.pem 1024 
// openssl req -new -key test-key.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey test-key.pem -out test-cert.pem	
		console.log("*** Using temp SSL keys on the nodejs server");
	 	var privateKey   = fs.readFileSync('ssl/test-key.pem');
	 	var certificate  = fs.readFileSync('ssl/test-cert.pem'); 

	//	var credentials = {key: privateKey, cert: certificate};	
		
    // use local self-signed cert
    var localCertOptions = { 
        key: privateKey, 
        cert: certificate, 
        requestCert: false, 
        rejectUnauthorized: false 
    }; 		
		

    https.createServer (localCertOptions, app).listen (runtime.port, function () { 
	   console.log(new Date().toISOString());
       console.log (runtime.architecture + ' server startup ok on port: ' + runtime.port); 

    }); 
		
 		
} else { // not local, its in the cloud somewhere bluemix/heroku

	app.set('port', runtime.port);
	
    if (runtime.architecture === "bluemix")
	{
	    // cloud loads certs and establish secure connection
		app.listen(runtime.port, function() {
			
		    console.log (runtime.architecture + ' server startup ok on port: ' + runtime.port); 
		}); 
	}
	else 
		if (runtime.architecture === "heroku")
	{ 
		app.listen(runtime.port, function() {
		    console.log (runtime.architecture + ' server startup ok on port: ' + runtime.port); 
		}); 			
	}		
}    
 
//app.use(logger('dev'));  // log every request to the console   morgan
app.use(bodyParser.json());

app.enable('trust proxy');
 
app.use (function (req, res, next) {  // req.protocol
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
				console.log("redirecting from http to https");
                res.redirect('https://' + req.headers.host + req.url);
        }
});

app.use( // public client pages  THIS FINDS _ngClient/index.html
			"/", //the URL throught which you want to access   static content
			express.static(__dirname + '/_ngClient')  //where your static content is located in your filesystem
				); 
app.use( // alias to third party js code etc
			"/js_thirdparty", //the URL throught which you want to access   content
			express.static(__dirname + '/js_thirdparty')  
				); 				

console.log(__dirname + '/_ngClient');

app.all('/*', function(req, res, next) {
    // CORS headers,     the * means any client can consume the service???
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS;
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next(); 
    }
});  
 
// middleware is performed before hitting the route handler proper (must pass middleware logic) 
// causes two authenications app.all('/api/v1/admin/*', [require('./middlewares/validateRequest').validateRequest]);
//app.all('/api/v1/*', [require('./routes/middlewares/validateRequest').validateRequest]);

 
function findStudents(findOptions, cb) {
        myCollection.find(findOptions).toArray(cb);
    }
 
function getStudents(req, res, findOptions, cb) {
  	findStudents( findOptions,  function(err, results) {
	 
	if(err)
		{// throw err;
			console.log("error:");
			console.log(err.message);
			res.status(404);
			res.json({"error": err.message});
		} 
	// console.log(results);		 
	res.status(200);
	res.json(results);	
	});
    } 

app.delete('/api/v1/student/:_id', function(req, res) {  
    console.log('DELETE /api/v1/student');
	console.log(req.params._id);
	myCollection.deleteOne({  _id  :  ObjectID(req.params._id)}  , function(err, result) {
    if(err)
	{
		// throw err;
		console.log("error:");
		console.log(err.message);
		res.status(404);
		res.json({"error": err.message});		
	}
        
    if(!err) 
       console.log("student entry deleted");
   	   res.status(200);
	   console.log(JSON.stringify(result))
	   res.json(result);	    
	});		
	
});
	
app.put('/api/v1/student', function(req, res) {  
  
    console.log('PUT /api/v1/student');
	console.log(req.body);
 
	myCollection.insert(req.body, function(err, result) {
    if(err)
	{
		// throw err;
		console.log("error:");
		console.log(err.message);
		res.status(404);
		res.json({"error": err.message});		
	}
        
    if(!err) 
       console.log("student entry saved");
   	   res.status(200);
	   res.json(result);	    
	});		
});	


app.post('/api/v1/student', function(req, res) {   // update a student
    console.log('POST /api/v1/student');
	console.log(req.body);
	
	var _id = req.body._id;
	delete req.body._id;
	myCollection.update({"_id" : ObjectID(_id)},req.body,{}, function(err, result) {
    if(err)
	{
		// throw err;
		console.log("error:");
		console.log(err.message);
		res.status(404);
		res.json({"error": err.message});		
	}
        
    if(!err) 
       console.log("student entry saved");
   	   res.status(200);
	   res.json(result);	    
	});		
});
 
app.get('/api/v1/students', function(req, res) { // allows a browser url call
  
    console.log('GET /api/v1/students');
	 
	var findOptions = {};
	
	getStudents(req,res,findOptions);
});

app.post('/api/v1/students', function(req, res) { // need the post method to pass filters in the body
  
    console.log('POST /api/v1/students');
	 
	var findOptions = {};
	
	// these checks could be normalised to a function
	if (req.body.course) 
	{
		findOptions.course = {$eq : req.body.course};
	}
	if (req.body.year) 
	{
		findOptions.year = {$eq : parseInt( req.body.year )};
	}	
 
	console.log(findOptions)
	getStudents(req,res,findOptions);
});

app.post('/api/v1/loadstudents', function(req, res) { // API restful semantic issues 
  
    console.log('POST /api/v1/loadstudents');
	 
	var records = [
		{
			"name" : "bloggs, joseph",
			"course" : "applied",
			"year" : 1
		},
		{
			"name" : "bloggs, thomas",
			"course" : "ssd",
			"year" : 2
		},
		{
			"name" : "smith, joe",
			"course" : "forensics",
			"year" : 3
		},
		{
			"name" : "walsh, ben",
			"course" : "ssd",
			"year" : 4
		},
		{
			"name" : "murphy, alan",
			"course" : "ssd",
			"year" : 4
		},
		{
			"name" : "doyle, tom",
			"course" : "forensics",
			"year" : 4
		},
		{
			"name" : "fitzpatrick, joe",
			"course" : "applied",
			"year" : 3
		},
		{
			"name" : "furlong, joe",
			"course" : "ssd",
			"year" : 3
		},
		{
			"name" : "murphy, edel",
			"course" : "ssd",
			"year" : 3
		},
		{
			"name" : "sunderland, william",
			"course" : "applied",
			"year" : 4
		},
		{
			"name" : "meagher, kevin",
			"course" : "ssd",
			"year" : 3
		},
		{
			"name" : "walsh, aoife",
			"course" : "ssd",
			"year" : 1
		},
		{
			"name" : "dunne, niamh",
			"course" : "ssd",
			"year" : 4
		},
		{
			"name" : "connors, tom",
			"course" : "forensics",
			"year" : 1
		},
		{
			"name" : "walsh, bob",
			"course" : "forensics",
			"year" : 2
		},
		{
			"name" : "smith, ann",
			"course" : "ssd",
			"year" : 3
		},
		{
			"name" : "fitzpatrick, alan",
			"course" : "applied",
			"year" : 4
		},
		{
			"name" : "murphy, mary",
			"course" : "ssd",
			"year" : 4
		},
		{
			"name" : "jones, pat",
			"course" : "ssd",
			"year" : 3
		},
		{
			"name" : "o grady, pat",
			"course" : "ssd",
			"year" : 3
		}	
	];
	 
	 
	var errorFlag = false;  // can use for feedback
	var insertCount = 0;
	
	records.forEach( function (arrayItem)
	{
		myCollection.insert( arrayItem, function(err, result) {
			if(err)
			{
				errorFlag = true;
			}
			insertCount++;
		});
	});	 
	var result = {'errorFlag' : errorFlag , 'insertCount' : insertCount};
	console.log(result)
	res.status(200);
	res.json(result);
 
});

app.delete('/api/v1/deletestudents', function(req, res) {  
    console.log('DELETE /api/v1/loadstudents');
	var errorFlag = false;  // can use for feedback
	try {
		myCollection.deleteMany( {}, function(err, result)
		{
		  var resJSON = JSON.stringify(result);
          console.log(resJSON);
          console.log(result.result.n);
			res.status(200);
			res.json(resJSON);			
		});
	} catch (e) {
	   console.log(e);
			res.status(404);
			res.json({});			   
	}	
});


// all the server rest type route paths are mapped in index.js
// app.use('/', require('./routes')); // will load/use index.js by default from this folder

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
	console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
 
    var err = new Error('Route Not Found, are you using the correct http verb / is it defined?');
    err.status = 404;
		 
    next(err);
});
  
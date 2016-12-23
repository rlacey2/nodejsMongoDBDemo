// NEVER SAVE THIS FILE TO PUBLIC REPO/Location
// if using git, ensure it is in the .gitignore file

var fs = require('fs');
var platform = require('./routes/server_nodejs/platform.js');
var runtime = platform.configure();  
var liveUrl = "??????.eu-gb.mybluemix.net"
var liveSystem = false;
 
var dbname;
var cfEnv = require('cfenv'); // for environment variables
var cfCore = cfEnv.getAppEnv();
var absUrl = cfCore.url;

var username = "???????";   
var password = "?????";
 
 
mysqlCreds_AWS = {  // replaced by bluemix if necessary
	 
	  };
 
if (runtime.architecture === "bluemix") {
  // check the services loaded to the APP	
  console.log("Application is running in a bluemix cloud environment.");
  var services = JSON.parse(process.env.VCAP_SERVICES); // look for the AWS credentials
  
  for (var svcName in services) { // look for a service starting with 'mysql' from bluemix
	  if (svcName.match(/^user-provided/)) {
				console.log("user-provided");
                var mysqlCreds = services[svcName][0]['credentials'];;  // only one service at the moment
				console.log("------------------------------_______________-----------------------------------------");
				console.log(mysqlCreds);
				console.log("------------------------------_______________-----------------------------------------");				
				mysqlCreds_AWS = mysqlCreds;
				
				// if testing in the bluemix cloud always use TEST DB , system	allows for hot swaps
					if (runtime.liveSystem === false)
				{
				    
				    mysqlCreds_AWS.database = "XXX_TESTING";
					console.log("db: USING TEST DATABASE");
					console.log("HOST = " + runtime.host);
				}
				else
				{
					console.log("db: USING LIVE DATABASE");
				}
	  }
  }
  console.log("DB from enviroment = " + mysqlCreds_AWS.database);
}
else
	if (runtime.architecture === "heroku") {
		 mysqlCreds_AWS.database = "XXX_LIVE_DB";
		 console.log("db: USING LIVE DATABASE");
		}
	else
	{ // localhost
	 	mysqlCreds_AWS.database = "XXX_TESTING_DB";  // 	// changing this to XXX_LIVE_DB vs XXX_TESTING_DB allows localhost server access live data
	} 
  
  	runtime.database = mysqlCreds_AWS.database; 
	runtime.database_host = mysqlCreds_AWS.host; 
	

 
  
  // https://www.cleardb.com/blog/entry?id=pro-series/segment-100/how-many-mysql-connections-is-enough-for-my-app
 		// If you got the error message (code 1226) indicates that the entire MySQL server has run out of connection slots - this is the DoS scenario.
  
 

/// local mysql
var mysqlCredsLocalhost = {
    connectionLimit: 15, //important
    host: "127.0.0.1",
    hostname: "127.0.0.1", // added for console logging

    port: 3306,
    "username": username,
    "user": username,
    "password": password,
    database: dbname, // nb using same name both hosts
    multipleStatements: false, // securer
    debug: false,
    charset: "utf8_general_ci"
};
 
var reCapthchaPublicKey = "?????????????????";  

 
var secret = {
 
    isLiveSystem : function () { return runtime.liveSystem;},
	
	
	mongodb : {   
				  connectionStr : function ()
				  {	
					var username = "aaaaa";
					var password = "bbbbb";
					var url      = "xxxxxx.mlab.com:xxxxxx";
					var database = "testing01";
					runtime.mongodb =  url + "/" + database;
					return "mongodb://" + username + ":" + password  + "@" + url + "/" + database;
				  },
				  
				  connectionStrLocalhost : function ()
				  {	
					var username = "";
					var password = "";
					var url      = "localhost:27017";
					var database = "testing01";
					runtime.mongodb =  url + "/" + database;
					//return "mongodb://" + username + ":" + password  + "@" + url + "/" + database; // authenication
					return "mongodb://" + url + "/" + database;		 // no authenication			
				  }		
	          },
 
    AWS: function() {
       // console.log("AWS: requires static ip address for security, not easy with bluemmix");
        return mysqlCreds_AWS;
    },

    localhost: function() {
        return mysqlCredsLocalhost;
    },
 
    reCapthchaPublicKey: function() {
        return reCapthchaPublicKey;
    },
	
	stripeKey :  function()
	{
		// overrule the logic above  see services setStripeKey also for CLIENT
		if (runtime.liveSystem == false)
		{
		    return "sk_test_?????????????????";
		}
	    else
		{
			return "sk_live_?????????";  
		}
	},	

	googleReCAPTCHA_KEY()
	{   // at some future point this might be project/customer specific for scaling
 	
		if (runtime.isLocalHost === true || runtime.liveSystem  === false)	// not live system			
		{
		 console.log("TEST SYSTEM ReCAPTCHA_KEY");
		  return "????????????????";  		
		}
		else
		{ // live system recaptch only, all others use above
	     console.log("LIVE SYSTEM ReCAPTCHA_KEY");
		  
		  return "????????????????";  		 
		}
 
	},
	
	paypal : function()
	{
		return {
					"port" : 8443,
					"api" : {
						"host" : "api.sandbox.paypal.com",
						"port" : "",
						"client_id" : "????????",
						"client_secret" : "?????????"
					}
				};
	}
};


module.exports = secret;
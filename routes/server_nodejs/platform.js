// platform.js

//  detect the necessary hardware platform that the app is running in to make informed startup decisions.
// expose one object with values

console.log("platform configuration")
var cfEnv = require('cfenv'); // for environment variables, bluemix only
var os = require('os');
var cfCore = cfEnv.getAppEnv();
var liveUrl = "???????.eu-gb.mybluemix.net" 
var configuration = {};
 
var configure = function( ) {  

    // detect the platform 
	// localhost vs bluemix vs heroku
	configuration.architecture =  undefined;
	
	configuration.isLocalHost = true;
	configuration.liveSystem = false;  // refers to the live system url
	
	configuration.hostname =  os.hostname() ;
	
	configuration.mongodb = "none";
	
	if (process.env.NODE && process.env.NODE.indexOf("heroku") > -1)
		{		   
			configuration.architecture = "heroku";
		   	configuration.isLocalHost = false;
			configuration.liveSystem = true;  // ALWAYS
			configuration.port =  (process.env.PORT || 5000)
			// host generation  https://gist.github.com/tobius/6381034
			configuration.host =  'heroku generate this?' ;			
			
		} 
		else
			if (process.env.VCAP_SERVICES) { // exposed by bluemix in the cloud ? ANY OTHER PROVIDER
				configuration.architecture  = "bluemix";
				configuration.absUrl = cfCore.url;
				configuration.isLocalHost = false;
				// may be live system or test system
				if (cfCore.name.indexOf(liveUrl) > -1  ) //   
					{
						configuration.liveSystem = true;		
					}
				else
					{
						configuration.liveSystem = false; // its localhost or bluemix test system	
					}
					
				if (process.env.cloud_controller_url.indexOf("bluemix.net") > -1 )
					{ 
						//	process.env.VCAP_APP_HOST was 0.0.0.0 in bluemix not a searchable string 
						// a remote installation
						//configuration.port = (process.env.VCAP_APP_PORT || 3443);
						//configuration.host = (process.env.VCAP_APP_HOST || 'localhost');	
// diego ready ?						
						configuration.port = (process.env.VCAP_APP_PORT || 8080);        // Diego is 8080	
						configuration.host = (process.env.VCAP_APP_HOST || '0.0.0.0');	 // Diego is 0.0.0.0					
					}						
				}
			else // must be localhost
			{
				configuration.architecture = "localhost";	 
				configuration.port =  3443;
				configuration.host =  'localhost' ;
			}
 
    return configuration;
} 
 
var getconfiguration = function( ) {  
		return configuration;
	}
 
  
    configure();  // run once

var platform = { // exposed api on the server 
	 configure : getconfiguration 
    	 
};
 
module.exports = platform;
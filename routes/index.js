var https = require('https'); 
var express = require('express');
var router = express.Router();
  
var secrets = require('../secrets.js');  
var gSECRET = secrets.googleReCAPTCHA_KEY();
 
/*
* Server side Routes that can be accessed by any one
*/
 

console.log("");
var testMode = true; 
 
/* ************************

LIVE ROUTES

*************************** */ 
 
 
/*
* Admin Routes that can be accessed only by authenticated & authorized users
  
*/

var students = {
			       getStudents :  function(req,res)
				   {
					  
					   var s = [{
									"_id" :  "585485d61d34cf1d50de3971" ,
									"name" : "bloggs, joe",
									"course" : "ssd",
									"year" : 4
								},

								/* 2 */
								{
									"_id" :  "585487de0c522d19dcde2eb5" ,
									"name" : "bloggs, joe",
									"course" : "ssd",
									"year" : 4
								}
								];
					   res.status(200);
					   res.json(s);
				   }
				} 
 
router.post('/api/v1/test1', function(req,res) {  
        res.status(200);
		console.log(req.body);
		return res.send(req.body);  
		});

router.get('/api/v1/students', students.getStudents); // restricted fields

router.post('/api/v1/request', function(req,res) {  
        console.log("/api/v1/request")


		delete req.body.password;
		req.body.note1 = "Password removed, proper application would have logged-in status for authenticated admin routes.";
		req.body.note2 = "Would also verify recaptcha with private key here";		
		
		
		//console.log(req.body);
 
        var g_recaptcha_response = req.body.recaptchaResponse || undefined;	
 	
		verifyRecaptcha(g_recaptcha_response, function(success) { // could wrap this in a promise
			    //console.log("google response = " + success);
                if (success) {
					   // console.log("recaptcha success");
						delete req.body.recaptchaResponse;
						//
						// put your business logic here
						req.body.a = "reCaptcha server-side authenticated successfully!";
						res.status(200);
						return res.send(req.body);  // echo back the input minus the password
						//
						 
                } else {
					    console.log("recaptcha failure"); //.response.error("Error: " + "reCAPTCHA failed verification with Google, sorry.");
					    res.status(404);
                        return res.json({ "message": "reCaptcha failed, try again." });            
                }
        });		
		}); 	
		
// https://developers.google.com/recaptcha/docs/verify?hl=en
function verifyRecaptcha(key, callback) {  // check that the recaptcha response is still valid
        https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + gSECRET + "&response=" + key, function(res) {
                var data = "";
                res.on('data', function (chunk) {
                        data += chunk.toString();
                });
                res.on('end', function() {
                        try {
                                var parsedData = JSON.parse(data);
                                //console.log(parsedData);
                                callback(parsedData.success);
                        } catch (e) {
                                callback(false);
                        }
                });
        });
} 		
		
		
		
		
 
module.exports = router;
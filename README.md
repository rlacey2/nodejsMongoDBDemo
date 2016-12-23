# December 2016 monogodb Demo

A nodejs application template/shell that is designed to run on:

1. localhost   
2. IBM Bluemix 
3. Heroku

The server uses express and the client side angular.


You will need to configure your mongodb database along with user permissions. In secrets.js you can configure the connection strings in the mongodb section. In server.js uncomment/comment the appropriate line 'var mDB = ****' for the connection string.

https://robomongo.org/ is one GUI for mongodb.

### Configuration Files

You will need to edit manifest.yml, package.json and _deploy_bluemix.bat to replace "servergeneric" with your application name.
Otherwise you may have deployment errors.

IBM Bluemix and/or Heroku require you to have the relevant command line tools installed to use these platforms.
You will need to rename the application to something other than servergeneric to avoid a name clash.
 
### platform.js 
As this is a simple shell, platform.js is used to provide an object that supplies platform/configuration information.
The user will need to use this objec.t in any relevant business logic for platform specific behaviour. See server.js and secrets.js for usage.
See the usage for variable 'runtime'

The default logic is that localhost is for testing and cloud deployment to Bluemix/Heroku is a live system.
This allows for testing keys and production keys if relevant. If not needed, edit the files to return the same keys each time.

### secrets.js
This file should never be exposed with private keys to a public repo such as github/bitbucket etc.
Add it to your .gitignore file.
Ideally keys should be deployed in the cloud via environment variables/services.

### localhost

As node server.js after doing a npm update. 

### Bluemix

https://console.ng.bluemix.net/docs/cli/index.html#cli

_login_bluemix.bat allows a login to a bluemix account, edit with your account settings.

_deploy_bluemix.bat pushes the application to bluemix, i.e. these commands in a .bat file.

    cf login -u XXXXX -o YYYYYY -s dev
	cf push servergeneric -f ./manifest.yml  --no-start
	cf enable-diego servergeneric
	cf start servergeneric
	
### heroku

https://devcenter.heroku.com/categories/command-line

https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up 

https://devcenter.heroku.com/articles/git
 
In the app folder/directory containing server.js

    heroku auth:login
    heroku create servergeneric02             #  ensure name is unique
    git config user.email "you@example.com used with heroku"
    git config user.name "Your Name"  
    git add .  
    git commit –m "heroku test 01" 
    git push heroku master	 


### SSL Keys:

openssl was used to generate the keys in /ssl these should never be used for a production system.
 
### Google Recaptcha keys:

You will need to have a google recaptcha key pair to use the recaptcha submit form.
https://www.google.com/recaptcha/intro/comingsoon/invisiblebeta.html

The private key needs to be placed in secrets.js in the function googleReCAPTCHA_KEY().

The public key needs to placed in /_ngClient/js/controllers/controllers.js in the recaptchaCtrl controller.
Insert your public key instead of the "set me".

$scope.reCapthchaPublicKey = "set me ";
 
### Demo:

There may be examples running at:

https://servergeneric.eu-gb.mybluemix.net

https://servergeneric.herokuapp.com

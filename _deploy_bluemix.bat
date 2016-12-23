echo off
cls
cf  spaces
echo Are you logged into the correct Bluemix account?
pause
 
 
cf push servergeneric -f ./manifest.yml  --no-start
cf enable-diego servergeneric
cf start servergeneric
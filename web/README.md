PRELIMINARY
       If EC/RSA private keys are required, follow the below instruction.
       Under the SafeBrowsing/web folder, run "npm install & npm start &" to start the docker-wrapped server and complete the registration.
       EC/RSA private keys are then generated for blacklist building.

SYNOPSIS
       node ./buildSecBlacklist [-p <path>] [-o <path>] [-m value] [-e value] [-l value] [-f name] 

OPTIONS
       -p 
	relative path for input data file in JSON format
       
       -o
	relative path for output encrypted blacklist
       
       -m 
	max number of items to build

       -e 
	interval number to log the time difference

       -l
	log status，0 for no log， 1 (default) for major logs, 2 for log on every item

       -f 
	oprf method, ec or rsa  

EXAMPLE
       node ./buildSecBlackList.js -f ec -o out.json -p ../testData/dummy.withoutmeta.json -e 50 -m 1000 -l 1 >> log
file &

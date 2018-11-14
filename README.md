
## Note: This project is related to a paper under submission. To maintain anonymity, we use this new account to publish the source code. Later, we will make the original DEV repository public:)

# Introduction

PPSB is an open-sourced Privacy-Preserving Safe Browsing platform. It enables the Safe Browsing (SB) service without sacrificing your privacy. Particularly, in PPSB, the actual URL to be checked, as well as its associated hashes or hash prefixes, never leave your browser in cleartext.

PPSB allows you to collaboratively choose different third-party content providers with their update-to-date lists of unsafe URLs. For demonstration purpose, we have included a default source (25,304 unsafe domains) in this extension, where the blacklist is from MalwareDomains.com and the server is maintained by ourselves. The current available blacklist sources are listed [here](https://goo.gl/bUBhpz).

If you are a content provider and want to deploy your own PPSB server, please watch this [video](https://youtu.be/EEpZJpFhEWQ). By using our lightweight yet stand-alone Docker image (ppsb/server), you can easily and privately contribute your valuable blacklist. Note that these published blacklists are always encrypted and kept private within the PPSB platform.

# Starting PPSB server via Docker

1. Run server
2. Install Docker
   1. `sudo apt-get update`
   2. `sudo apt-get install apt-transport-https ca-certificates curl software-properties-common`
   3. `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`
   4. `sudo apt-key fingerprint 0EBFCD88`
   5. `sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"`
   6. `sudo apt-get update`
   7. `sudo apt-get install docker-ce`
   8. `docker --version`
3. Run Docker
   1. `sudo docker run -tid -p 80:80 ppsb/server:v1`
4. Access the IP address/URL of this server via a web browsing
   1. Register
   2. Upload a blacklist in JSON format
   3. Encrypt and publish it
5. Stop Docker
   1. `sudo docker container ls`
   2. `sudo docker stop [container id]`

**Note: You can watch this 1-min [video](https://youtu.be/EEpZJpFhEWQ) to see how to do deploy a PPSB server via Docker.**

 
# Starting PPSB cluster server 

## (by default, the number of instances equals to the number of CPU cores)

1. Clone PPSB from GitHub
   1. `$ sudo -s`
   2. `# mkdir /data`
   3. `# cd /data`
   4. `# git clone https://.../SafeBrowsing.git` (*change this to a real git address*)
2. Install `Node.js`
   1. `# apt-get update`
   2. `# apt-get install curl python-software-properties`
   3. `# curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`
   4. `# apt-get install nodejs`
   5. `node -v` and `npm -v`
3. Update `npm` and install `pm2`
   1. `# npm i npm -g`
   2. `# npm install pm2@latest -g`
4. Install `redis-server`
   1. `# apt install redis-server`
5. Start service
   1. `# cd /SafeBrowsing/web/`
   2. `# npm install`
   3. `# npm start`
   4. `# pm2 list`
5. Access the IP address/URL of this server via a web browsing
   1. Register ...
6. Stop service
   1. `npm stop`

FROM ubuntu:16.04

RUN apt-get update \
	&& apt-get install -y curl \
	&& curl -sL https://deb.nodesource.com/setup_8.x | /bin/bash \
	&& apt-get install -y nodejs \
	&& apt-get install -y redis-server \
	&& npm i npm install -g \
	&& npm install forever -g \
	&& npm install -g pm2 \
	&& mkdir /data \
	&& mkdir /data/SafeBrowsing

COPY web /data/SafeBrowsing/web

RUN cd /data/SafeBrowsing/web \
	&& chmod 751 entrypoint.sh \
	&& npm install

ENTRYPOINT ["/data/SafeBrowsing/web/entrypoint.sh"]

EXPOSE 80

CMD /bin/bash

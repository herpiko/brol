FROM debian:jessie
MAINTAINER Herpiko Dwi Aguno <herpiko@gmail.com>
ENV DOCKYARD_SRC="."
ENV DOCKYARD_SRVHOME=/opt
ENV DOCKYARD_SRVPROJ=/opt/brol
EXPOSE 3000
RUN echo 'Acquire::ForceIPv4 "true";' | tee /etc/apt/apt.conf.d/99force-ipv4
RUN apt-get -y update && apt-get -y install wget mongodb-server curl wget apt-transport-https build-essential tcl8.5 redis-server
RUN wget http://download.redis.io/releases/redis-stable.tar.gz
RUN tar xzf redis-stable.tar.gz
RUN cd redis-stable && make && make install && cd utils && echo | ./install_server.sh
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUn apt-get -y update && apt-get -y install yarn
RUN bash -l -c "source ~/.bashrc"
RUN bash -l -c "nvm install v6"
RUN bash -l -c "nvm use v6"
RUN bash -l -c "npm install -g node-gyp"
COPY $DOCKYARD_SRC $DOCKYARD_SRVPROJ
WORKDIR $DOCKYARD_SRVPROJ
RUN bash -l -c "yarn"
RUN sed -ie 's/localhost\/brol/172.17.0.1:27017\/brol/g' config.json
CMD bash -l -c "redis-server /etc/redis/6379.conf && npm run start"

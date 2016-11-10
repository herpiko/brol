FROM debian:jessie
MAINTAINER Herpiko Dwi Aguno <herpiko@gmail.com>
ENV DOCKYARD_SRC="."
ENV DOCKYARD_SRVHOME=/opt
ENV DOCKYARD_SRVPROJ=/opt/brol
EXPOSE 3000
RUN apt-get -y update && apt-get -y install wget mongodb-server
RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
RUN bash -l -c "source ~/.bashrc"
RUN bash -l -c "nvm install v6"
RUN bash -l -c "nvm use v6"
RUN bash -l -c "npm install -g node-gyp yarn"
COPY $DOCKYARD_SRC $DOCKYARD_SRVPROJ
WORKDIR $DOCKYARD_SRVPROJ
RUN bash -l -c "yarn"
CMD bash -l -c "npm run prod"

FROM node
ENV DEBIAN_FRONTEND noninteractive
RUN npm -g install parcel-bundler
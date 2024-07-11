# Use an official Node.js runtime as a parent image
FROM node:20-alpine

WORKDIR /usr/src/app

# Install necessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache bash git helm openssh yq github-cli openjdk11 sudo

COPY .npmrc .

COPY package.json .

RUN node --max-old-space-size=8000 $(which npm) install

RUN npm install -g @angular/cli@17

COPY . .

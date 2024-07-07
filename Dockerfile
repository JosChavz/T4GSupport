# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Define arguments for user and directory setup
ARG UID=1000
ARG GUID=1000
ARG USERNAME=node
ARG DIR=/usr/src/app

# Set working directory
WORKDIR $DIR

# Install necessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache bash git helm openssh yq github-cli openjdk11 sudo

# Add a user and group ONLY if it does not exist
RUN if ! getent passwd $UID; then adduser -D -u $UID -s /bin/bash $USERNAME; fi
RUN if ! getent group $GUID; then addgroup -g $GUID $USERNAME; fi

# Create directory for npm packages
RUN mkdir -p "${HOME}/.npm-packages"

# Update .bashrc to set npm configuration
RUN echo "NPM_PACKAGES=${HOME}/.npm-packages" >> ${HOME}/.bashrc \
    && echo "prefix=${HOME}/.npm-packages" >> ${HOME}/.npmrc \
    && echo "NODE_PATH=\"\$NPM_PACKAGES/lib/node_modules:\$NODE_PATH\"" >> ${HOME}/.bashrc \
    && echo "PATH=\"\$NPM_PACKAGES/bin:\$PATH\"" >> ${HOME}/.bashrc \
    && echo "source ~/.bashrc" >> ${HOME}/.bash_profile

# Source .bashrc to apply changes
RUN /bin/sh -c "source ${HOME}/.bashrc"

# Install Angular CLI, PNPM CLI, and Firebase CLI as root
RUN npm install -g @angular/cli@17 \
    && npm install -g firebase-tools


# Copy package.json and package-lock.json files
COPY package*.json $DIR/

# Copy the project files into the container
COPY . $DIR/

RUN sudo chown -R $UID:$GUID $DIR

# Set permissions for the npm cache directory
RUN mkdir -p /tmp/.npm && chown -R $UID:$GUID /tmp/.npm

# Setup Firebase emulators as root
RUN firebase setup:emulators:ui && firebase setup:emulators:firestore

# Expose the application port and Firebase emulator ports
EXPOSE 4200 8080 9099 5002 4000 4500 9150 4400

# Start the application
CMD ["firebase", "emulators:start", "--only", "auth,firestore,ui", "--project", "demo-t4g-support"]
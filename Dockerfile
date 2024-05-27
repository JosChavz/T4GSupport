FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

RUN apk update
RUN apk upgrade
RUN apk --no-cache add bash git helm openssh yq github-cli openjdk11

# Install Angular CLI
RUN npm install -g @angular/cli@17

# Installing PNPM CLI
RUN npm install -g pnpm

# Install Firebase CLI
RUN npm install -g firebase-tools

RUN firebase setup:emulators:ui
RUN firebase setup:emulators:firestore

RUN mkdir -p /firebase

# Copy package.json and package-lock.json files
COPY package*.json ./

# Copy the project files into the container
COPY . .

# Expose the application port and Firebase emulator ports
EXPOSE 4200 8080 9099 5002 4000 4500 9150 4400

# Start the application
CMD ["firebase", "emulators:start", "--only", "auth,firestore,ui", "--project", "demo-t4g-support"]

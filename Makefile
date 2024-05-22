# Define the image name
IMAGE_NAME=my-angular-firebase-app

# Capture the current directory
CURRENT_DIR := $(shell pwd)

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .
	docker run --rm -v $(CURRENT_DIR):/usr/src/app -v $(CURRENT_DIR)/node_modules:/usr/src/app/node_modules $(IMAGE_NAME) npm install

# Run the Docker container with Firebase emulators running in the background
run:
	docker run -d --name firebase-emulators \
               -p 4200:4200 \
               -p 8080:8080 \
               -p 9099:9099 \
               -p 4000:4000 \
               -p 4500:4500 \
               -p 9150:9150 \
               -p 4400:4400 \
               -v $(CURRENT_DIR):/usr/src/app \
               -v $(CURRENT_DIR)/node_modules:/usr/src/app/node_modules \
               $(IMAGE_NAME)

# Start the Angular application interactively
start-angular:
	docker exec -it firebase-emulators ng serve --host 0.0.0.0

# Check if Firebase emulators are running by inspecting the logs
check:
	docker logs firebase-emulators

# Access to the container
access:
	docker exec -it firebase-emulators /bin/bash

# Stop and remove the Docker container
clean:
	docker stop firebase-emulators
	docker rm firebase-emulators

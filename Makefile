# Define the image name
IMAGE_NAME=my-angular-firebase-app-image
CONTAINER_NAME=my-angular-app
DIR=/usr/src/app

# Capture the current directory and user details
CURRENT_DIR := $(shell pwd)
USERNAME := $(shell whoami)
UID := $(shell id -u)
GUID := $(shell id -g)

# Builds the Docker image and makes sure that the node_modules are installed using `npm`
build:
	docker build -t $(IMAGE_NAME) --build-arg="DIR=$(DIR)" --build-arg="UID=$(UID)" --build-arg="USERNAME=$(USERNAME)" --build-arg="GUID=$(GUID)" .
	docker run --rm -v $(CURRENT_DIR):$(DIR) \
		-v $(CURRENT_DIR)/node_modules:$(DIR)/node_modules $(IMAGE_NAME) npm install

# Run the Docker container with Firebase emulators running in the background
run:
# Removes the container if it exists
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
# Run the container with the Firebase emulators
	docker container run -d --name $(CONTAINER_NAME) \
               -p 4200:4200 \
               -p 8080:8080 \
               -p 9099:9099 \
               -p 4000:4000 \
               -p 4500:4500 \
               -p 9150:9150 \
               -p 4400:4400 \
							 -u $(UID):$(GUID) \
               -v $(CURRENT_DIR):$(DIR) \
               -v $(CURRENT_DIR)/node_modules:$(DIR)/node_modules \
               $(IMAGE_NAME)

# Start the Angular application interactively
serve:
	docker exec -it $(CONTAINER_NAME) ng serve --host 0.0.0.0

# Check if Firebase emulators are running by inspecting the logs
check:
	docker logs $(CONTAINER_NAME)

# Access to the container
access:
	docker exec -it $(CONTAINER_NAME) /bin/bash

# Stop and remove the Docker container
clean:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

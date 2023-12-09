# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app/client

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the local code to the container
COPY . .

# Expose port 5173 to the outside world
EXPOSE 5173

# Run the application
 CMD ["npm", "start"]

# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app/server

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies + ignore scripts for security '--ignore-scripts '
RUN npm install
# Copy the local code to the container
COPY . .

# Build the DB
RUN npm run populate

# Expose port 3001 to the outside world
EXPOSE 3001

# Run the application start == node index.js
CMD ["npm", "start"]

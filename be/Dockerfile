FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# Allow use of either server.js or app.js as entry point
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else node app.js; fi"]

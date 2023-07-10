# Use a base image with Node.js
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the container
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the container port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
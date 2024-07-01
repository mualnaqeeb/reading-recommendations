###############################
# BASE IMAGE SETUP #
###############################

# Base image setup
FROM node:20.10.0-alpine AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies using npm ci for a clean install
RUN npm ci

###############################
# DEVELOPMENT IMAGE SETUP #
###############################

# Build stage for local development
FROM base AS development

# Copy the entire application code into the container
COPY . .

# Copy the .env file into the container
COPY .env .env

# Set the user to 'node'
USER node

########################
# BUILD FOR PRODUCTION #
########################

# Build stage
FROM base AS build

# Copy the entire application code from the development stage
COPY . .

# Generate Prisma artifacts
RUN npx prisma generate

# Run build scripts or other build-specific commands
RUN npm run build

# Prune development dependencies and install production dependencies
RUN npm ci --only=production

##############
# PRODUCTION #
##############

# Production stage
FROM node:20.10.0-alpine AS production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only production node_modules from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copy the built application from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Copy other necessary runtime files or directories from the build stage
COPY --from=build /usr/src/app/.env ./.env

# Specify the command to run your application
CMD [ "node", "dist/main.js" ]

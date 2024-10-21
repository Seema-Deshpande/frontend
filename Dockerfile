FROM node:18.20.2

WORKDIR /COE-GLOBAL_GEMINNI_POC/frontend

COPY package*.json ./

# Install dependencies
RUN npm install -g @angular/cli

RUN ["npm", "ci"]

COPY . .
# Expose the port the app runs on
EXPOSE 4200

# Command to run the application
CMD ["ng", "serve", "--host", "0.0.0.0"]

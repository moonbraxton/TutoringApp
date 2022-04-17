FROM node:latest
   
WORKDIR /usr/src/app
COPY package*.json ./
COPY src ./src
RUN npm install

# Bundle app source
COPY . .

EXPOSE 80
CMD [ "node", "src/server/server.js" ]

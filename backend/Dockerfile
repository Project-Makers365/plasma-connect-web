FROM node:20-alpine
 
WORKDIR /app
 
COPY package*.json ./
 
RUN npm install --production
 
COPY . .
 
RUN chmod +x start.sh
 
EXPOSE 8033
 
CMD ["sh", "start.sh"]
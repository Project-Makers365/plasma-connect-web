# Step 1: Build React App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


FROM nginx:alpine

RUN apk add --no-cache openssl

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint-https.sh /docker-entrypoint-https.sh
RUN chmod +x /docker-entrypoint-https.sh

EXPOSE 80
EXPOSE 443

CMD ["/docker-entrypoint-https.sh"]

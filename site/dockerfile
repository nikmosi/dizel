FROM nginx:alpine3.20
      
WORKDIR /usr/share/nginx/html

COPY . .
RUN chown -R nginx:nginx .

EXPOSE 80
EXPOSE 443

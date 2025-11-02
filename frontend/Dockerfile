FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
# plain static frontend, nginx will serve index.html and proxy /api -> backend
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

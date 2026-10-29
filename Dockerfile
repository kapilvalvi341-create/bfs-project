FROM nginx:alpine
COPY index.html style.css app.js bfs.js /usr/share/nginx/html/
EXPOSE 80

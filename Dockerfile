FROM nginx:alpine

# Copy the frontend files to the Nginx html directory
COPY frontend /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

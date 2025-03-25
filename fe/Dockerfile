FROM nginx:alpine

# Create directories for the application
WORKDIR /usr/share/nginx/html

# Copy frontend files to the container
COPY index.html .
COPY vm-script.js .
COPY utils.js .

# Configure Nginx (optional, use default config for now)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Use the default Nginx command
CMD ["nginx", "-g", "daemon off;"]

# Build Stage (Not needed for static HTML but good structure)
# We use direct Nginx alpine image for minimal footprint

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets (Our HTML file)
# Assumes index.html is in a 'public' folder relative to Dockerfile context
COPY public/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

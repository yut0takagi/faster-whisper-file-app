# Next.js frontend (development mode)
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy app code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1
# Bind to 0.0.0.0 for Docker
ENV HOSTNAME=0.0.0.0

# Run dev server
CMD ["npm", "run", "dev"]


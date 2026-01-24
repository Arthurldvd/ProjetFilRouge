# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build argument for API URL (can be overridden at build time)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production (nginx)
# ============================================
FROM nginx:alpine AS runner

# Copy custom nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Railway uses PORT environment variable
ENV PORT=80

# Expose port (Railway will override this)
EXPOSE ${PORT}

# Start nginx with envsubst for dynamic port
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"

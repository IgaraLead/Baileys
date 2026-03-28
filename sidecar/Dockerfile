FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Force git to use HTTPS instead of SSH
RUN git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" \
    && git config --global url."https://github.com/".insteadOf "git@github.com:"

# Copy the entire Baileys project
COPY . /baileys
WORKDIR /baileys

# Build the Baileys library first
RUN npm install && npm run build

# Install sidecar dependencies and build
WORKDIR /baileys/sidecar
RUN npm install && npm run build

# Create sessions and media directories
RUN mkdir -p /data/sessions /data/media

# Run as non-root user
RUN groupadd -r sidecar && useradd -r -g sidecar -d /baileys sidecar \
    && chown -R sidecar:sidecar /baileys /data
USER sidecar

ENV NODE_ENV=production
ENV SESSIONS_DIR=/data/sessions
ENV MEDIA_DIR=/data/media
ENV PORT=3500

EXPOSE 3500

VOLUME ["/data/sessions"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "const h=require('http');h.get('http://localhost:3500/health',r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]

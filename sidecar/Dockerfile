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

# Install sidecar dependencies
WORKDIR /baileys/sidecar
RUN npm install

# Create sessions and media directories
RUN mkdir -p /data/sessions /data/media

ENV NODE_ENV=production
ENV SESSIONS_DIR=/data/sessions
ENV MEDIA_DIR=/data/media
ENV PORT=3500

EXPOSE 3500

VOLUME ["/data/sessions"]

CMD ["npx", "tsx", "src/index.ts"]

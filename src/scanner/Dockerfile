# Filename: Dockerfile
FROM node:slim AS base

FROM node:slim as builder
WORKDIR /app

# Copy package.json
COPY package.json yarn.lock* ./

# Install NPM dependencies for function
RUN yarn install

ADD webpack.config.cjs ./webpack.config.cjs
ADD src ./src

RUN yarn run build

FROM base as final


# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget ca-certificates -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# FROM public.ecr.aws/lambda/nodejs:14.2022.09.09.11
# Create working directory
WORKDIR /usr/src/app

# Copy the actual nodejs-files
COPY --from=builder /app/dist ./dist

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init


# Copy plugin
ADD fihnjjcciajhdojfnbdddfaoknhalnja ./fihnjjcciajhdojfnbdddfaoknhalnja

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app

USER pptruser

# Expose app
EXPOSE 3000
# Run app
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
ARG VITE_GITHUB_URL
ARG VITE_TELEGRAM_URL
ARG VITE_INSTAGRAM_URL
ARG VITE_FACEBOOK_URL
ARG VITE_LINKEDIN_URL
ARG VITE_CONTACT_EMAIL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server ./server
USER node
EXPOSE 4173
CMD ["node", "server/index.mjs"]

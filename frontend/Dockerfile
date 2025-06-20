# Stage 1: Build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Укажи переменные окружения для React
ARG REACT_APP_USER_API
ARG REACT_APP_TRACK_API
ARG REACT_APP_CART_API
ENV REACT_APP_USER_API=$REACT_APP_USER_API
ENV REACT_APP_TRACK_API=$REACT_APP_TRACK_API
ENV REACT_APP_CART_API=$REACT_APP_CART_API

RUN npm run build

# Stage 2: Serve production build
FROM node:18
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
CMD ["serve", "-s", "build"]

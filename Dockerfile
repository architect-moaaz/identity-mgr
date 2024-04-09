FROM node:16.17.1-alpine3.16 as build
WORKDIR /usr/app
COPY  package.json ./
 RUN npm install\
        && npm install typescript -g
COPY . /usr/app
RUN tsc

FROM node:16.17.1-alpine3.16
WORKDIR /usr/app
ARG PROFILE
COPY  package.json ./
RUN npm i
EXPOSE 31523
ENV NODE_ENV=$PROFILE
RUN echo "$NODE_ENV"
COPY --from=build /usr/app/ /usr/app
CMD ["node", "dist/server.js"]
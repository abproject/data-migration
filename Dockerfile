FROM node:10 AS build
WORKDIR /usr/src/app
COPY . /usr/src/app
#Backend
RUN npm install
RUN npm run build
#Frontend
RUN npm --prefix ./webapp install
RUN npm --prefix ./webapp run build:prod
RUN mv ./webapp/dist/app ./dist/public/


FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3000
CMD [ "node", "dist/index.js" ]

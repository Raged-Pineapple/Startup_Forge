FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# For production, we should build and serve, but for simplicity/dev parity
# we will run vite in host mode.
CMD ["npm", "run", "dev", "--", "--host"] 

# base node image
FROM node:18-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /remix

ADD package.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /remix

COPY --from=deps /remix/node_modules /remix/node_modules
ADD package.json ./
RUN npm prune --production

# Build the app
FROM base as build

WORKDIR /remix

COPY --from=deps /remix/node_modules /remix/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /remix

COPY --from=production-deps /remix/node_modules /remix/node_modules

COPY --from=build /remix/build /remix/build
COPY --from=build /remix/public /remix/public
ADD . .

EXPOSE 3000
CMD ["npm", "start"]

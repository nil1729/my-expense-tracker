const Redis = require("redis");
const logger = require("../config/logger");
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_USER = process.env.REDIS_USER;

const RedisClient = Redis.createClient({
  url: `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
});

RedisClient.on("error", function (err) {
  console.debug(err);
  logger.error("error connection to redis instance ");
});

module.exports = RedisClient;

const RedisClient = require("./client");
const logger = require("../config/logger");
const MAX_CACHE_TTL = Number(process.env.MAX_CACHE_TTL);

class ExpenseTrackerCache {
  constructor() {
    this.connect();
  }

  async connect() {
    await RedisClient.connect();
    logger.info("cache client connected successfully");
  }

  async setCache(key, value, expiry = false, ttl = MAX_CACHE_TTL) {
    if (typeof value !== "string") {
      throw new Error("value must be a string");
    }
    logger.info(`saving cache with key [${key}]`);
    let ack = null;
    if (expiry) {
      ack = await RedisClient.setEx(key, ttl, value);
    } else {
      ack = await RedisClient.set(key, value);
    }
    logger.info(`saved cache with key [${key}] | ack [${ack}]`);
  }

  async getCache(key) {
    try {
      logger.info(`getting cache having the key [${key}]`);
      const cachedValue = await RedisClient.get(key);
      return cachedValue;
    } catch (e) {
      return null;
    }
  }
}

module.exports = new ExpenseTrackerCache();

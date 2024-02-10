const RedisClient = require("./client");
const logger = require("../config/logger");

class ExpenseTrackerCache {
  constructor() {
    this.connect();
  }

  async connect() {
    await RedisClient.connect();
    logger.info("cache client connected successfully");
  }

  async setCache(key, value) {
    if (typeof value !== "string") {
      throw new Error("value must be a string");
    }
    logger.info(`saving cache with key [${key}]`);
    const ack = await RedisClient.set(key, value);
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

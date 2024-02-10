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
}

module.exports = new ExpenseTrackerCache();

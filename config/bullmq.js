const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_TLS_ENABLED = Boolean(Number(process.env.REDIS_TLS_ENABLED));

const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  tls: REDIS_TLS_ENABLED,
};

module.exports = {
  connection: redisConnection,
};

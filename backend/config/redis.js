const Redis = require('ioredis');

let client;

const connectRedis = () => {
  client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  client.on('connect', () => console.log('Redis connected'));
  client.on('error', (err) => console.error('Redis error:', err));
};

const getRedis = () => client;

// Helper: cache wrapper
const cache = async (key, ttlSeconds, fetchFn) => {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetchFn();
  await client.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
};

module.exports = { connectRedis, getRedis, cache };
const { createClient } = require('redis');

let client = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        tls: false,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('Redis: max reconnect attempts reached, disabling cache');
            return false;
          }
          return Math.min(retries * 500, 2000);
        },
      },
    });

    client.on('error', (err) => {
      console.warn('Redis error (non-fatal):', err.message);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('Redis connected to Redis Cloud');
      isConnected = true;
    });

    client.on('disconnect', () => {
      isConnected = false;
    });

    await client.connect();
    isConnected = true;
  } catch (err) {
    console.warn('Redis unavailable — app continues without cache:', err.message);
    isConnected = false;
  }
};

const cache = async (key, ttlSeconds, fetchFn) => {
  if (!isConnected || !client) return fetchFn();

  try {
    const cached = await client.get(key);
    if (cached) return JSON.parse(cached);

    const data = await fetchFn();
    if (data) await client.setEx(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Redis cache miss, falling back to DB:', err.message);
    return fetchFn();
  }
};

const invalidate = async (key) => {
  if (!isConnected || !client) return;
  try {
    await client.del(key);
  } catch (_) {}
};

module.exports = { connectRedis, cache, invalidate };
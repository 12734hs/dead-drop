const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient({
      url: 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.log('Redis Client Error:', err);
    });

    this.client.connect();
  }

  async get(key){
    return this.client.get(key)
  };

  async set(key, value, time) {
    return this.client.set(key, value, {
        EX: time,
    })};
  async del(key) {
    return this.client.del(key);
  }
};

const redisClient = new RedisClient();

export default redisClient;
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const maxRetries = 5;
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not set in environment');
    process.exit(1);
  }

  const connectWithRetry = async (retryCount = 0) => {
    try {
      await mongoose.connect(uri);
      logger.info('MongoDB connected successfully');

      try {
        await mongoose.connection.collection('users').dropIndex('phone_1');
        logger.info('Dropped stale phone_1 index from users collection');
      } catch (idxErr) {
        // Ignore - index may not exist or collection empty
      }
    } catch (error) {
      const attempt = retryCount + 1;
      logger.error(`MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, error.message);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        return connectWithRetry(attempt);
      }

      logger.error('MongoDB connection failed after max retries');
      process.exit(1);
    }
  };

  await connectWithRetry();
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

module.exports = connectDB;

import redisClient from '../config/redis.config.js'

const RATE_LIMIT_PER_SECOND = 1
const RATE_LIMIT_PER_MINUTE = 20

const rateLimiter = async (req, res, next) => {
  const userId = req.body.userId

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    // Key setup for storing user rate info in Redis
    const secondKey = `rate-limit-second:${userId}`
    const minuteKey = `rate-limit-minute:${userId}`

    // Increment and get current counts for second and minute windows
    const [secondCount, minuteCount] = await Promise.all([
      redisClient.incr(secondKey),
      redisClient.incr(minuteKey)
    ]);

    // Set TTLs for both keys if not already set
    if (secondCount === 1) await redisClient.expire(secondKey, 1)
    if (minuteCount === 1) await redisClient.expire(minuteKey, 60)

    // Check rate limits
    if (secondCount > RATE_LIMIT_PER_SECOND) {
      return res.status(429).json({ error: 'Rate limit exceeded: 1 task per second allowed.' })
    }
    if (minuteCount > RATE_LIMIT_PER_MINUTE) {
      return res.status(429).json({ error: 'Rate limit exceeded: 20 tasks per minute allowed.' })
    }

    next()
  } catch (error) {
    console.error('Rate limiting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export { rateLimiter}
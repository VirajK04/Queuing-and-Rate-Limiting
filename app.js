import express from 'express'
import Queue from 'bull'
import winston from 'winston'
import dotenv from 'dotenv'
import { rateLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

const logger = winston.createLogger({
    transports: [
      new winston.transports.File({ filename: 'task_logs.log' })
    ]
  });

async function task(userid) {
    console.log(`${userid}-task completed at-${Date.now()}`)
    logger.info(`User Id : ${userid}-task completed at-${Date.now()}`)
}

// Define the task processing queue
const taskQueue = new Queue('taskQueue', {
    redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});
  

// Route to handle the task request
app.post('/process-task', rateLimiter, async (req, res) => {
    const userId = req.body.userId;

    // Add the task to the queue with userId as a job key
    const job = await taskQueue.add({ userId }, {
        removeOnComplete: true,
        removeOnFail: true
    });

    res.status(200).json({
        message: 'Task is added to the queue',
        jobId: job.id
    });
});

// Process tasks in the queue
taskQueue.process(async (job) => {
    const { userId } = job.data;

    // Simulate task processing (e.g., 500 ms task duration)
    console.log(`Processing task for user: ${userId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`Task for user ${userId} completed`);
    task(userId)
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
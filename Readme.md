# Queuing and Rate Limiting


## Problem Statement

Your task is to build a Node.js API cluster with two replica sets and create a route
to handle a simple task. The task has a rate limit of 1 task per second and 20 task
per min for each user ID. Users will hit the route to process tasks multiple times.
You need to implement a queueing system to ensure that tasks are processed
according to the rate limit for each user ID.


# Implementation

This project uses technologies like pm2 for clustering and Redis and Bull for Queuing.

## Setup

Step 1 - Install pm2 globally

```bash
npm install -g pm2
```
Step 2 - Add a .env file using values provided in .env.sample

You can use Redis on cloud or install locally.

I have used a docker container for Redis as it is easy.
You can also run docker container using the command below.

```bash
sudo docker run -p 6379:6379 --name redis -d redis redis-server --appendonly yes
``` 

For the above docker container you can use the following .env file

```javascript
//.env file
PORT = //add port value
REDIS_HOST = 127.0.0.1
REDIS_PORT = 6379
```
Step 3 - Run the following command

```bash
npm run dev
```
This will execute the following code from package.json file
```json
"scripts": {
    ...................................................
    "dev": "pm2 start index.js -i 2 --name api-cluster"
  },
```
## Endpoint

 ### Post request at ``` /api/v1/task```

Use Postman or any another tool and make a post request at above endpoint.

The body should be provided in json format as follows-
```json
{
"user_id":"123"
}
```
## Working

First we have been told to implement a nodejs cluster with two replica sets. It is done with "pm2" by running "npm run dev" command which inokes the original pm2 command.

Next I have used Redis and Bull for Queuing and Rate Limiting.
Bull works on top of Redis.

So first Redis should be configured. For this purpose we have ```redis.config.js``` in ```config``` folder.  

I have then created a middleware called as ```rateLimiter.js``` which is in ```middleware``` folder. It applies the mentioned rate limit to incoming requests.

```app.js``` contains all other necessary functions and routes.

I have also used Winston for logging the completed requests to a file.

## Some Considerations
When using ``` npm run dev``` for running applications you will get two replica sets whic will both be listening on mentioned port. But for some reason I don't know why Postman is not showing output message even though everything is working fine. You can check that you get proper status code and also task completion is logged to ```task_logs.log``` file.

But if you want to check Postman message you can just run ```node index.js``` command by which there will be only one process running and it shows properly.  

## Final

Please let me know whatever bugs you find and I will try to improve the application.
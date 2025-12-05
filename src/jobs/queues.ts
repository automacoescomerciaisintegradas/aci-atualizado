import { Queue } from "bullmq";

// Centralized BullMQ queues used by the application.
// Adjust the Redis connection URL if needed (default localhost).
export const contentQueue = new Queue("content", {
    connection: {
        host: "127.0.0.1",
        port: 6379,
    },
});

export const telegramQueue = new Queue("telegram", {
    connection: {
        host: "127.0.0.1",
        port: 6379,
    },
});

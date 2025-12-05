import { z } from "zod";

/*** Auth ***/
export const magicLinkSchema = z.object({
    email: z.string().email(),
});

/*** Credit Operations ***/
export const rechargeSchema = z.object({
    amountCents: z.number().int().positive().max(10_000_00), // até R$ 10.000,00
});

export const consumeSchema = z.object({
    action: z.enum(["WORD", "POST_SEND", "IMAGE_GENERATION"]),
    quantity: z.number().int().positive(),
});

/*** Content Generation ***/
export const generateArticleSchema = z.object({
    prompt: z.string().min(10),
    wordCount: z.number().int().positive().min(500),
});

/*** Scheduler ***/
export const scheduleSchema = z.object({
    action: z.string(),
    payload: z.any(),
    scheduledAt: z.string().datetime(),
});

/*** Telegram Integration ***/
export const telegramConnectSchema = z.object({
    botToken: z.string().min(30),
});

/*** WordPress Integration ***/
export const wordpressConnectSchema = z.object({
    siteUrl: z.string().url(),
    username: z.string(),
    applicationPassword: z.string(),
});

/*** Pagination Helper ***/
export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
});

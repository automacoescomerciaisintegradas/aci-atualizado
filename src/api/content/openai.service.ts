import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate an article using OpenAI.
 * @param prompt - The instruction for the article.
 * @param wordCount - Approximate number of words.
 */
export async function generateArticle({
    prompt,
    wordCount,
}: {
    prompt: string;
    wordCount: number;
}): Promise<string> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are an SEO‑focused writer. Produce a long‑form article (>1500 words) with proper headings (H2, H3), a meta description, and a conclusion. Use a friendly, professional tone.",
            },
            {
                role: "user",
                content: `${prompt}\n\nTarget length: ~${wordCount} words.`,
            },
        ],
        temperature: 0.7,
        max_tokens: Math.ceil(wordCount * 1.5), // rough estimate
    });

    return response.choices[0].message.content ?? "";
}

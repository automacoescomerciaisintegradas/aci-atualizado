
export function calculateWordCost(wordCount: number, model: string): number {
    const rate = model.includes('gpt-4') ? 0.012 : 0.00089;
    return wordCount * rate;
}

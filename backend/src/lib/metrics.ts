import type { GenerateResponseRecord } from "../shared/schema.js";

type MetricInput = {
  text: string;
  prompt: string;
};

export function analyzeQuality({ text, prompt }: MetricInput): GenerateResponseRecord["metrics"] {
  const sentences = text.split(/[.!?]+/).map((segment) => segment.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const promptWords = prompt.split(/\s+/).filter(Boolean);

  const averageSentenceLength =
    sentences.reduce((total, sentence) => total + sentence.split(/\s+/).filter(Boolean).length, 0) /
    Math.max(1, sentences.length);

  const coherence =
    sentences.length > 1
      ? Math.max(0, Math.min(1, 1 - Math.abs(averageSentenceLength - promptWords.length / Math.max(1, sentences.length)) / 25))
      : 0.75;

  const completeness = Math.min(1, words.length / Math.max(1, promptWords.length * 1.5));

  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  const redundancy = uniqueWords.size === 0 ? 1 : Math.max(0, 1 - (words.length - uniqueWords.size) / Math.max(1, words.length));

  const readability = Math.max(
    0,
    Math.min(
      1,
      1 -
        Math.abs(computeFleschKincaid(words.length, sentences.length) - 60) /
          100
    )
  );

  const structure = sentences.length >= 3 ? 0.8 : 0.5;

  const score = Number(((coherence + completeness + redundancy + readability + structure) / 5).toFixed(2));

  return {
    coherence: Number(coherence.toFixed(2)),
    completeness: Number(completeness.toFixed(2)),
    redundancy: Number(redundancy.toFixed(2)),
    readability: Number(readability.toFixed(2)),
    structure: Number(structure.toFixed(2)),
    score,
  };
}

function computeFleschKincaid(wordCount: number, sentenceCount: number) {
  if (wordCount === 0 || sentenceCount === 0) {
    return 0;
  }
  const syllableEstimate = wordCount * 1.3;
  return 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableEstimate / wordCount);
}

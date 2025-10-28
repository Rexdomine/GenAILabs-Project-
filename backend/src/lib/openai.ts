import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions.js";

import type { GenerateRequestInput, GenerateResponseRecord, ParameterSet } from "../shared/schema.js";

import { env } from "../env.js";
import { analyzeQuality } from "./metrics.js";
import { pseudoUuid } from "./pseudo-uuid.js";

const DEFAULT_MODEL = "gpt-4o-mini";

const openai =
  env.OPENAI_API_KEY && env.NODE_ENV !== "test" ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export function buildParameterPairs(parameters: GenerateRequestInput["parameters"], n: number): ParameterSet[] {
  const pairs: ParameterSet[] = [];
  for (const temperature of parameters.temperature) {
    for (const topP of parameters.top_p) {
      pairs.push({ temperature, topP, variations: n });
    }
  }
  return pairs;
}

export async function generateResponses(input: GenerateRequestInput): Promise<GenerateResponseRecord[]> {
  const combinations = buildParameterPairs(input.parameters, input.n);

  if (!openai || !env.OPENAI_API_KEY) {
    return mockResponses(input, combinations);
  }

  const results: GenerateResponseRecord[] = [];

  for (const combo of combinations) {
    try {
      const completion = await openai.chat.completions.create({
        model: input.model ?? DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant helping researchers evaluate sampling parameters. Provide thorough, factual answers with clear structure.",
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
        temperature: combo.temperature,
        top_p: combo.topP,
        n: Math.min(input.n, 5),
      });

      collectChoices(results, completion, combo, input.prompt);
    } catch (error) {
      console.error("OpenAI generation failed, using fallback response", error);
      results.push(...mockResponses({ prompt: input.prompt, n: input.n }, [combo]));
    }
  }

  return results;
}

function collectChoices(
  results: GenerateResponseRecord[],
  completion: ChatCompletion,
  combo: ParameterSet,
  prompt: string
) {
  completion.choices.forEach((choice, index) => {
    const text =
      choice.message?.content ??
      `No text returned from model for temperature ${combo.temperature} and top_p ${combo.topP}.`;

    results.push({
      id: pseudoUuid(),
      parameterSet: combo,
      variationIndex: index,
      response: text,
      metrics: analyzeQuality({ text, prompt }),
      createdAt: new Date(),
    });
  });
}

function mockResponses(
  input: Pick<GenerateRequestInput, "prompt" | "n">,
  combinations: ParameterSet[]
): GenerateResponseRecord[] {
  return combinations.flatMap((combo) => {
    return Array.from({ length: input.n }, (_, index) => {
      const generatedText = renderPlaceholderResponse(input.prompt, combo, index);

      return {
        id: pseudoUuid(),
        parameterSet: combo,
        variationIndex: index,
        response: generatedText,
        metrics: analyzeQuality({ text: generatedText, prompt: input.prompt }),
        createdAt: new Date(),
      };
    });
  });
}

function renderPlaceholderResponse(prompt: string, parameterSet: ParameterSet, variationIndex: number) {
  const guidance = [
    "structured",
    "conversational",
    "concise",
    "imaginative",
    "technical",
    "analytical",
  ];

  const tone = guidance[Math.floor(Math.random() * guidance.length)];

  return [
    `Prompt sample #${variationIndex + 1}: ${prompt}`,
    ``,
    `This is a simulated response generated with temperature ${parameterSet.temperature.toFixed(2)} and top_p ${parameterSet.topP.toFixed(
      2
    )}.`,
    `Tone guidance: ${tone}.`,
    `Replace with the real OpenAI response once the API credentials are configured on the server.`,
  ].join("\n");
}

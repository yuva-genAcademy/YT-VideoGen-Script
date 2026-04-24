import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const MODEL = "claude-sonnet-4-6";

const MAX_TOKENS = 300;
const SHORT_TOKENS = 150;

async function ask(prompt, maxTokens = MAX_TOKENS) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }]
  });
  return response.content[0].text.trim();
}

async function main() {
  const results = {};

  console.log("Running Zero-shot coding...");
  results.zeroShotCode = await ask("My Python code is slow. How do I make it faster?");

  console.log("Running Few-shot coding...");
  results.fewShotCode = await ask(`Q: My React app re-renders too much. How do I fix it?
A: Use React.memo, move state closer to usage, avoid object literals in JSX props.

Q: My SQL queries are timing out. How do I fix it?
A: Add indexes on WHERE/JOIN columns, avoid SELECT *, use EXPLAIN to find slow scans.

Q: My Python code is slow. How do I make it faster?
A:`, SHORT_TOKENS);

  console.log("Running Role coding...");
  results.roleCode = await ask(`You are a senior Python performance engineer with 10 years of experience optimising production systems at scale.

My Python code is slow. How do I make it faster?`);

  console.log("Running CoT coding...");
  results.cotCode = await ask(`My Python code is slow. How do I make it faster?

Think step by step before giving your final recommendation.`);

  console.log("Running Self-Consistency coding v1...");
  results.scCodeV1 = await ask("My Python code is slow. How do I make it faster?", SHORT_TOKENS);
  
  console.log("Running Self-Consistency coding v2...");
  results.scCodeV2 = await ask("I'm having performance issues with my Python application. What optimization techniques should I apply?", SHORT_TOKENS);
  
  console.log("Running Self-Consistency coding v3...");
  results.scCodeV3 = await ask("Python script running too slow in production. What are the most impactful ways to speed it up?", SHORT_TOKENS);

  console.log("Running ToT coding...");
  results.totCode = await ask(`My Python code is slow. How do I make it faster?

Explore THREE approaches:
Approach 1 (Algorithmic): fix logic and data structures
Approach 2 (Language-level): use Python built-ins and libraries
Approach 3 (Infrastructure): parallelism, caching, compiled extensions

Evaluate each, then give your best combined recommendation.`, 400);

  console.log("Running ReAct coding...");
  results.reactCode = await ask(`Use this exact format:
Thought: (your reasoning)
Action: (what you decide to do)
Observation: (what you find)
...repeat as needed...
Final Answer: (your recommendation)

Question: My Python code is slow. How do I make it faster?`, 400);

  console.log("Running Chaining coding step 1...");
  results.chainCodeStep1 = await ask(`The user says: "My Python code is slow."
List the top 3 most common root causes. 3 bullet points only.`, SHORT_TOKENS);

  console.log("Running Chaining coding step 2...");
  results.chainCodeStep2 = await ask(`A Python developer says their code is slow. The diagnosis found these root causes:
${results.chainCodeStep1}

Based on this diagnosis, provide a targeted 3-step optimization plan. Be specific and actionable.`, MAX_TOKENS);

  // Health prompts (secondary)
  console.log("Running Zero-shot health...");
  results.zeroShotHealth = await ask("I need to lose weight. What should I do?", SHORT_TOKENS);

  console.log("Running Few-shot health...");
  results.fewShotHealth = await ask(`Q: I want to sleep better. What should I do?
A: Fix your sleep schedule, avoid screens 1hr before bed, keep room cool and dark.

Q: I want to drink more water. What should I do?
A: Carry a bottle everywhere, set hourly reminders, drink a glass before every meal.

Q: I need to lose weight. What should I do?
A:`, SHORT_TOKENS);

  console.log("Running Role health...");
  results.roleHealth = await ask(`You are a certified nutritionist and personal trainer with 15 years of experience helping busy professionals lose weight sustainably.

I need to lose weight. What should I do?`, SHORT_TOKENS);

  console.log("Running CoT health...");
  results.cotHealth = await ask(`I need to lose weight. What should I do?

Think step by step before giving your final recommendation.`, MAX_TOKENS);

  console.log("Running SC health v1...");
  results.scHealthV1 = await ask("I need to lose weight. What should I do?", SHORT_TOKENS);
  console.log("Running SC health v2...");
  results.scHealthV2 = await ask("I want to lose some weight. What's the most effective approach?", SHORT_TOKENS);
  console.log("Running SC health v3...");
  results.scHealthV3 = await ask("How can I shed excess weight? What steps should I take?", SHORT_TOKENS);

  console.log("Running ToT health...");
  results.totHealth = await ask(`I need to lose weight. What should I do?

Explore THREE approaches:
Approach 1 (Diet-first): nutrition-only strategy
Approach 2 (Exercise-first): movement-only strategy
Approach 3 (Habits-first): lifestyle change strategy

Evaluate each, then give your best combined recommendation.`, 350);

  console.log("Running ReAct health...");
  results.reactHealth = await ask(`Use this exact format:
Thought: (your reasoning)
Action: (what you decide to do)
Observation: (what you find)
...repeat as needed...
Final Answer: (your recommendation)

Question: I need to lose weight. What should I do?`, 350);

  console.log("Running Chaining health step 1...");
  results.chainHealthStep1 = await ask(`The user says: "I need to lose weight."
List the top 3 root causes of weight gain. 3 bullet points only.`, SHORT_TOKENS);

  console.log("Running Chaining health step 2...");
  results.chainHealthStep2 = await ask(`A person says they need to lose weight. The diagnosis found these root causes:
${results.chainHealthStep1}

Based on this diagnosis, provide a targeted 3-step action plan. Be specific and actionable.`, MAX_TOKENS);

  console.log("\n\n=== RESULTS JSON ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);

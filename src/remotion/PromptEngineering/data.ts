export const MODEL_NAME = 'claude-sonnet-4-6';

export const ZERO_SHOT = {
  coding: {
    prompt: 'My Python code is slow.\nHow do I make it faster?',
    response:
      'Start by profiling with cProfile or line_profiler to identify bottlenecks before optimizing blindly. Focus on improving algorithmic complexity first — switching from O(n²) to O(n log n) yields the biggest gains. Leverage Python\'s built-in functions and standard library modules, which are implemented in C and significantly faster than pure Python equivalents.',
  },
  health: {
    prompt: 'I need to lose weight.\nWhat should I do?',
    response:
      'Losing weight comes down to maintaining a calorie deficit through a balanced diet and regular physical activity. Focus on whole foods, reduce processed sugars, and aim for 150 minutes of moderate exercise per week. Prioritizing quality sleep and managing stress are also important — both directly impact metabolism and hunger-regulating hormones.',
  },
};

export const FEW_SHOT = {
  coding: {
    prompt:
      'Q: My React app re-renders too much. How do I fix it?\nA: Use React.memo, move state closer to usage, avoid object literals in JSX props.\n\nQ: My SQL queries are timing out. How do I fix it?\nA: Add indexes on WHERE/JOIN columns, avoid SELECT *, use EXPLAIN to find slow scans.\n\nQ: My Python code is slow. How do I make it faster?\nA:',
    response:
      'Profile with cProfile, replace loops with NumPy vectorization, and cache repeated computations with functools.lru_cache.',
  },
  health: {
    prompt:
      'Q: I want to sleep better. What should I do?\nA: Fix your sleep schedule, avoid screens 1hr before bed, keep room cool and dark.\n\nQ: I want to drink more water. What should I do?\nA: Carry a bottle everywhere, set hourly reminders, drink a glass before every meal.\n\nQ: I need to lose weight. What should I do?\nA:',
    response:
      'Eat in a calorie deficit, increase daily movement, and stay consistent with both habits over time.',
  },
};

export const ROLE = {
  coding: {
    prompt:
      'You are a senior Python performance engineer with 10 years of experience optimising production systems at scale.\n\nMy Python code is slow. How do I make it faster?',
    response:
      'Start by profiling with cProfile — never optimize blind. Once you\'ve pinpointed hotspots, analyze algorithmic complexity; an O(n²) loop won\'t be fixed by micro-optimization. Offload numerical ops to NumPy or use C-backed builtins like map() and itertools. Consider generators over list comprehensions for large datasets — memory allocation patterns matter at scale.',
  },
  health: {
    prompt:
      'You are a certified nutritionist and personal trainer with 15 years of experience helping busy professionals lose weight sustainably.\n\nI need to lose weight. What should I do?',
    response:
      'Sustainable fat loss requires a 300–500 kcal deficit below your TDEE — aggressive cuts sacrifice lean muscle and tank metabolism. Prioritize protein at 1.6–2.2g per kg to preserve muscle during a cut. Pair this with progressive overload resistance training; strength work is non-negotiable for body recomposition. Adherence over perfection — consistency with macros beats any crash protocol.',
  },
};

export const COT = {
  coding: {
    prompt:
      'My Python code is slow. How do I make it faster?\n\nThink step by step before giving your final recommendation.',
    response:
      'Step 1: Diagnose — what kind of slow? I/O-bound, CPU-bound, or memory-bound?\nStep 2: Profile with cProfile or line_profiler to pinpoint the exact bottleneck.\nStep 3: Fix the hotspot — vectorize loops with NumPy, cache repeated calls with lru_cache, use generators to reduce memory pressure.\nFinal: Never guess — profile first, then optimize the 20% causing 80% of slowness.',
  },
  health: {
    prompt:
      'I need to lose weight. What should I do?\n\nThink step by step before giving your final recommendation.',
    response:
      'Step 1: Assess current state — track calories in vs out, activity level, and sleep quality.\nStep 2: Create a modest 300–500 calorie daily deficit through diet adjustments, avoiding extreme cuts.\nStep 3: Add 150 mins/week of moderate cardio and 2 strength sessions.\nFinal: A sustainable deficit plus consistent movement always beats any crash diet long-term.',
  },
};

export const SELF_CONSISTENCY = {
  coding: [
    {
      prompt: 'My Python code is slow. How do I make it faster?',
      response:
        'Profile first with cProfile. Replace slow loops with NumPy vectorized operations for dramatic speedups on numerical data.',
    },
    {
      prompt: "I'm having performance issues with my Python app. What optimization techniques should I apply?",
      response:
        'Apply caching with functools.lru_cache for repeated calls, and use async/await for I/O-bound tasks to unlock major gains.',
    },
    {
      prompt: 'Python script running too slow in production. What are the most impactful ways to speed it up?',
      response:
        'Audit your algorithms first — O(n²) kills production. Leverage compiled extensions like Cython for CPU-bound hotspots.',
    },
  ],
  codingConsensus:
    '• Profile / diagnose before optimizing — always find the actual bottleneck first\n• Replace pure Python with specialized tools (NumPy, async, compiled code) once confirmed',
  health: [
    {
      prompt: 'I need to lose weight. What should I do?',
      response:
        'Prioritize a calorie deficit through whole foods, cut processed sugar, and track intake. Sustainable diet changes drive most weight loss.',
    },
    {
      prompt: "I want to lose some weight. What's the most effective approach?",
      response:
        'Combine strength training with cardio consistently. Exercise boosts metabolism and preserves muscle, making weight loss more lasting.',
    },
    {
      prompt: 'How can I shed excess weight? What steps should I take?',
      response:
        'Build sustainable habits: consistent sleep, mindful eating, and daily movement. Small repeated behaviors compound into lasting change.',
    },
  ],
  healthConsensus:
    '• No single tactic wins — diet, exercise, and habits work best combined\n• Sustainability and consistency beat intensity every time',
};

export const TOT = {
  coding: {
    approaches: [
      { label: 'Approach 1 — Algorithmic', text: 'Fix O(n²) loops → O(n log n). Use sets/dicts over lists for lookups.' },
      { label: 'Approach 2 — Language-level', text: 'Replace loops with NumPy vectorization. Use map/filter, generators, lru_cache.' },
      { label: 'Approach 3 — Infrastructure', text: 'Multiprocessing for CPU tasks, async for I/O, Cython for hot paths.' },
    ],
    synthesis: 'Best combined: Profile first. Fix algorithms (biggest win), then vectorize, then parallelize only if needed.',
  },
  health: {
    approaches: [
      { label: 'Approach 1 — Diet-first', text: '500 cal/day deficit via whole foods. Fast results but needs discipline.' },
      { label: 'Approach 2 — Exercise-first', text: '45 min cardio 4×/week. Slower but builds a lasting habit.' },
      { label: 'Approach 3 — Habits-first', text: 'Sleep 8hrs, reduce stress, batch-cook meals. Sustainable long term.' },
    ],
    synthesis: 'Best combined: Modest deficit + 3×/week movement + 1 habit change per month.',
  },
};

export const REACT_DATA = {
  coding: [
    { type: 'Thought', text: 'I need to identify what type of slowness this is before recommending fixes.' },
    { type: 'Action', text: 'Run cProfile to find the top 5 slowest functions.' },
    { type: 'Observation', text: 'The bottleneck is a nested loop doing repeated list membership checks.' },
    { type: 'Thought', text: 'List lookups are O(n) — set lookups are O(1).' },
    { type: 'Action', text: 'Replace the list with a set for the membership check.' },
    { type: 'Observation', text: '40× speedup on that operation.' },
    { type: 'Final Answer', text: 'Profile first with cProfile. Convert repeated list lookups to sets. Vectorize remaining loops with NumPy.' },
  ],
  health: [
    { type: 'Thought', text: 'I need to understand current habits before prescribing changes.' },
    { type: 'Action', text: 'Assess caloric intake vs output and sleep quality.' },
    { type: 'Observation', text: 'User likely eating 300–500 cals over maintenance with poor sleep.' },
    { type: 'Thought', text: 'Sleep deprivation drives cortisol, which increases fat storage.' },
    { type: 'Action', text: 'Fix sleep first, then address diet.' },
    { type: 'Observation', text: 'Better sleep reduces cravings automatically.' },
    { type: 'Final Answer', text: 'Fix sleep to 7–8hrs first. Create a 400 cal deficit through portion control. Add 30-min walks.' },
  ],
};

export const CHAINING = {
  coding: {
    step1Prompt: 'The user says: "My Python code is slow."\nList the top 3 most common root causes.\n3 bullet points only.',
    step1Response:
      '• Inefficient algorithms with O(n²) or worse complexity — common in nested loops over large datasets\n• Repeated computations without memoization — recalculating the same result on every call\n• Pure Python loops where NumPy or Pandas vectorized ops could be far faster',
    step2Prompt: 'Based on the diagnosis above, provide a targeted 3-step optimization plan.',
    step2Response:
      '1. Refactor algorithms — swap nested loops for hash maps or sets to cut complexity.\n2. Cache aggressively — apply @lru_cache to pure functions; use Redis for shared data.\n3. Vectorize hot paths — replace Python loops with NumPy ops for 10–100× throughput gains.',
  },
  health: {
    step1Prompt: 'The user says: "I need to lose weight."\nList the top 3 root causes of weight gain.\n3 bullet points only.',
    step1Response:
      '• Chronic caloric surplus from frequent consumption of ultra-processed, calorie-dense foods\n• Sedentary lifestyle significantly reducing total daily energy expenditure (TDEE)\n• Chronic sleep deprivation elevating ghrelin (hunger) and suppressing leptin (satiety)',
    step2Prompt: 'Based on the diagnosis above, provide a targeted 3-step action plan.',
    step2Response:
      '1. Overhaul nutrition — cook 5 meals/week at home, targeting a 400 cal/day reduction.\n2. Increase daily movement — 20-min walk after dinner, take stairs, stand every hour.\n3. Prioritize sleep — target 7–8 hours, lights out by 11pm, keep room cool at 67°F.',
  },
};

import { backendEnv } from "./env.js";

const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_HISTORY = 12;
const CROP_LIST = ["wheat", "rice", "maize", "corn", "soybean", "cotton", "tomato", "onion", "potato", "sugarcane", "mustard", "paddy"];

function normalizeMessages(messages) {
  return (messages ?? [])
    .filter((item) => item && typeof item.content === "string" && (item.role === "user" || item.role === "assistant"))
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 1200),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_HISTORY);
}

function isGreeting(text = "") {
  const q = text.toLowerCase().trim();
  return /^(hi|hello|hey|namaste|hii|helo|good morning|good evening|good afternoon)$/.test(q);
}

function detectTopic(text = "") {
  const q = text.toLowerCase();
  if (/(irrigation|water|drip|sprinkler|sichai|pani|sinchai)/.test(q)) return "irrigation";
  if (/(rain|weather|forecast|wind|humidity|barish|mausam)/.test(q)) return "weather";
  if (/(disease|pest|fungus|blight|rust|insect|rog|keet)/.test(q)) return "disease";
  if (/(market|mandi|price|sell|profit|bazar|bazaar)/.test(q)) return "market";
  if (/(soil|npk|nitrogen|phosphorus|potassium|ph |fertiliz|mitti|khad)/.test(q)) return "soil";
  if (/(sowing|harvest|schedule|crop stage|buwai|katai)/.test(q)) return "schedule";
  return "general";
}

function inferTopic(messages) {
  const users = messages.filter((item) => item.role === "user");
  for (let index = users.length - 1; index >= 0; index -= 1) {
    const topic = detectTopic(users[index].content);
    if (topic !== "general") return topic;
  }
  return "general";
}

function detectCrop(text = "", context) {
  const q = text.toLowerCase();
  const found = CROP_LIST.find((crop) => q.includes(crop));
  if (found) return found[0].toUpperCase() + found.slice(1);
  const profileCrop = context?.profile?.primaryCrop;
  if (typeof profileCrop === "string" && profileCrop.trim()) return profileCrop.trim();
  return null;
}

function buildContextLines(context) {
  const lines = [];
  const profile = context?.profile;
  if (profile?.primaryCrop) lines.push(`Profile crop: ${profile.primaryCrop}`);
  if (profile?.village) lines.push(`Location: ${profile.village}`);
  const soil = context?.insights?.soil;
  if (soil?.healthLabel) lines.push(`Last soil health: ${soil.healthLabel} (${soil.healthScore ?? "--"}/100)`);
  const disease = context?.insights?.disease;
  if (disease?.primary?.name) lines.push(`Last disease signal: ${disease.primary.name}`);
  return lines;
}

function buildSystemPrompt(contextLines) {
  const contextBlock = contextLines.length ? `Context:\n- ${contextLines.join("\n- ")}` : "Context: limited user context.";
  return [
    "You are Farmer Copilot, a practical agriculture advisor.",
    "Reply in a conversational style but stay actionable.",
    "Use this structure: quick diagnosis, actions for today, actions for next 48h, risk and prevention, and one follow-up question.",
    "Avoid generic filler. If user says hello, respond warmly and guide with 2-3 useful question options.",
    "Do not fabricate exact weather/market numbers unless user gave data.",
    contextBlock,
  ].join(" ");
}

function topicPlaybook(topic, cropText) {
  if (topic === "weather") {
    return [
      `Weather plan for ${cropText}:`,
      "1) Today: spray only in low-wind windows.",
      "2) Next 48h: reduce or skip irrigation if rain chance is high.",
      "3) Risk: waterlogging and fungal pressure after persistent humidity.",
      "4) Prevention: keep drainage channels open and monitor lower canopy.",
    ];
  }
  if (topic === "irrigation") {
    return [
      `Irrigation plan for ${cropText}:`,
      "1) Today: irrigate only after top-soil moisture check.",
      "2) Next 48h: cut irrigation by 20-40% if rain is likely.",
      "3) Risk: overwatering can increase root stress and fungal risk.",
      "4) Prevention: use short cycles and avoid prolonged leaf wetness.",
    ];
  }
  if (topic === "disease") {
    return [
      `Disease response for ${cropText}:`,
      "1) Today: remove visibly infected leaves and isolate them.",
      "2) Next 48h: apply targeted spray in calm morning/evening windows.",
      "3) Risk: fast spread under high humidity and dense canopy.",
      "4) Prevention: improve airflow and avoid late overhead irrigation.",
    ];
  }
  if (topic === "market") {
    return [
      `Market plan for ${cropText}:`,
      "1) Today: compare rates across at least two mandis.",
      "2) Next 48h: if trend is rising, sell in batches.",
      "3) Risk: one-shot full sale increases timing risk.",
      "4) Prevention: use net price (mandi rate - transport) for decisions.",
    ];
  }
  if (topic === "soil") {
    return [
      `Soil and nutrient plan for ${cropText}:`,
      "1) Today: check NPK balance and pH suitability.",
      "2) Next 48h: use split nutrient dosing instead of one heavy application.",
      "3) Risk: imbalance can reduce growth and increase stress.",
      "4) Prevention: align nutrition timing with irrigation and weather.",
    ];
  }
  if (topic === "schedule") {
    return [
      `Farm schedule plan for ${cropText}:`,
      "1) Today: lock top two field priorities.",
      "2) Next 48h: schedule spray/irrigation slots using forecast windows.",
      "3) Risk: no-priority planning increases delays and costs.",
      "4) Prevention: use stage-wise checklist (sowing, growth, harvest).",
    ];
  }
  return [
    "I can give you a direct advisory plan right now.",
    "Tell me crop + issue + time window (today / next 48h).",
    "Example: Tomato leaf spots, rain expected in 2 days, what should I do?",
  ];
}

function fallbackReply(messages, context) {
  const latestUser = [...messages].reverse().find((item) => item.role === "user")?.content ?? "";
  const topic = detectTopic(latestUser) === "general" ? inferTopic(messages) : detectTopic(latestUser);
  const crop = detectCrop(latestUser, context) ?? "your crop";
  const contextLines = buildContextLines(context);

  if (isGreeting(latestUser)) {
    return [
      "Hello. I am your Farmer Copilot.",
      "I can help with weather, irrigation, disease, market selling, and soil planning.",
      `To start fast, tell me: crop name, current issue, and whether you need advice for today or next 48 hours.`,
      `Example: "Tomato leaf spots, rain expected in 2 days, what should I do?"`,
      ...contextLines.length ? ["", "Known context:", ...contextLines] : [],
    ].join("\n");
  }

  return [
    ...topicPlaybook(topic, crop),
    ...contextLines.length ? ["", "Known context:", ...contextLines] : [],
    "",
    "Follow-up: share crop stage and expected rain/humidity so I can refine dose and timing.",
  ].join("\n");
}

function getOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  if (!Array.isArray(payload?.output)) return "";

  const chunks = [];
  for (const item of payload.output) {
    if (!Array.isArray(item?.content)) continue;
    for (const contentItem of item.content) {
      const textValue = contentItem?.text;
      if (typeof textValue === "string" && textValue.trim()) chunks.push(textValue.trim());
    }
  }
  return chunks.join("\n").trim();
}

async function requestOpenAiReply(messages, contextLines) {
  if (!backendEnv.openaiApiKey) return null;

  const endpoint = backendEnv.openAiVisionEndpoint || "https://api.openai.com/v1/responses";
  const model = backendEnv.openaiVisionModel || DEFAULT_MODEL;
  const systemPrompt = buildSystemPrompt(contextLines);

  const input = [
    { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
    ...messages.map((item) => ({
      role: item.role,
      content: [{ type: "input_text", text: item.content }],
    })),
  ];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendEnv.openaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      input,
      temperature: 0.35,
      max_output_tokens: 420,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI chat failed with status ${response.status}`);
  const payload = await response.json();
  return getOutputText(payload) || null;
}

export async function getCopilotReply({ messages, context }) {
  const normalizedMessages = normalizeMessages(messages);
  if (normalizedMessages.length === 0) return "Hello. I am your Farmer Copilot. Ask me a farming question.";

  const contextLines = buildContextLines(context);
  try {
    const aiReply = await requestOpenAiReply(normalizedMessages, contextLines);
    if (aiReply) return aiReply;
  } catch {
    // Continue to deterministic advisory fallback.
  }

  return fallbackReply(normalizedMessages, context);
}

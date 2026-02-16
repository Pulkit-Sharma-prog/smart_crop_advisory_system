import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { askCopilot, type CopilotMessage } from "../services/copilotService";
import { getRuntimeConfigStatus } from "../services/systemService";

type SpeechRecognitionType = {
  lang: string;
  continuous?: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<{
      isFinal?: boolean;
      0?: { transcript: string };
    }>;
  }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type WindowWithSpeech = Window & typeof globalThis & {
  SpeechRecognition?: new () => SpeechRecognitionType;
  webkitSpeechRecognition?: new () => SpeechRecognitionType;
};

const MAX_MESSAGES = 40;
const STORAGE_KEY = "smart_crop_copilot_history_v1";

function getStarterPrompts(isHindi: boolean) {
  if (isHindi) {
    return [
      "Tomato me leaf spots hain, agle 2 din rain hai, kya karun?",
      "Aaj aur next 48 hours ke liye irrigation plan batao",
      "Wheat ko is week better price ke liye kaise sell karun?",
    ];
  }

  return [
    "Tomato leaf spots, rain expected in 2 days, what should I do?",
    "Give me an irrigation plan for today and next 48 hours",
    "How should I sell my wheat this week for better returns?",
  ];
}

export default function CopilotWidget() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [llmMode, setLlmMode] = useState<"llm" | "fallback" | "unknown">("unknown");
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    const greeting: CopilotMessage = { role: "assistant", content: t("copilot.greeting") };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [greeting];

    try {
      const parsed = JSON.parse(raw) as CopilotMessage[];
      if (!Array.isArray(parsed) || parsed.length === 0) return [greeting];
      return parsed
        .filter((item) => item && (item.role === "user" || item.role === "assistant"))
        .slice(-MAX_MESSAGES);
    } catch {
      return [greeting];
    }
  });

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const finalTranscriptRef = useRef("");
  const isHindi = i18n.language.toLowerCase().startsWith("hi");

  const speechCtor = useMemo(() => {
    const maybeWindow = window as WindowWithSpeech;
    return maybeWindow.SpeechRecognition ?? maybeWindow.webkitSpeechRecognition ?? null;
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void getRuntimeConfigStatus()
      .then((status) => {
        if (!active) return;
        setLlmMode(status.copilot.mode);
      })
      .catch(() => {
        if (!active) return;
        setLlmMode("unknown");
      });

    return () => {
      active = false;
    };
  }, [open]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setVoiceError(null);
    const userMessage: CopilotMessage = { role: "user", content: trimmed };
    const boundedMessages: CopilotMessage[] = [...messages, userMessage].slice(-MAX_MESSAGES);
    setMessages(boundedMessages);
    setInput("");
    setLoading(true);

    try {
      const answer = await askCopilot(boundedMessages, i18n.language);
      const assistantMessage: CopilotMessage = { role: "assistant", content: answer };
      setMessages((prev) => [...prev, assistantMessage].slice(-MAX_MESSAGES));
    } catch {
      const fallbackMessage: CopilotMessage = {
        role: "assistant",
        content: "I could not get a response right now. Please try again in a few seconds.",
      };
      setMessages((prev) =>
        [...prev, fallbackMessage].slice(-MAX_MESSAGES),
      );
    } finally {
      setLoading(false);
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const startVoice = () => {
    if (!speechCtor) {
      setVoiceError("Voice recognition is not available in this browser.");
      return;
    }

    if (listening) {
      stopVoice();
      return;
    }

    const r = new speechCtor();
    r.lang = isHindi ? "hi-IN" : "en-IN";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    finalTranscriptRef.current = "";
    setVoiceError(null);
    setListening(true);
    recognitionRef.current = r;

    r.onresult = (event) => {
      let finalText = finalTranscriptRef.current;
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const segment = event.results[index]?.[0]?.transcript ?? "";
        if (!segment) continue;

        if (event.results[index]?.isFinal) {
          finalText = `${finalText} ${segment}`.trim();
        } else {
          interimText = `${interimText} ${segment}`.trim();
        }
      }

      finalTranscriptRef.current = finalText;
      setInput(`${finalText} ${interimText}`.trim());
    };

    r.onerror = () => {
      setListening(false);
      setVoiceError("Voice input failed. Please try again.");
    };

    r.onend = () => {
      const spoken = finalTranscriptRef.current.trim();
      recognitionRef.current = null;
      finalTranscriptRef.current = "";
      setListening(false);

      if (spoken && !loading) {
        void ask(spoken);
      }
    };

    r.start();
  };

  const speakLast = () => {
    const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant");
    if (!lastAssistant) return;

    const utterance = new SpeechSynthesisUtterance(lastAssistant.content);
    utterance.lang = isHindi ? "hi-IN" : "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const resetChat = () => {
    const greeting: CopilotMessage = { role: "assistant", content: t("copilot.greeting") };
    setMessages([greeting]);
    setInput("");
    setVoiceError(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([greeting]));
  };

  const starterPrompts = getStarterPrompts(isHindi);

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {open ? (
        <div className="w-[340px] max-w-[90vw] surface-card-strong p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-forest-900">{t("copilot.title")}</h3>
            <div className="flex items-center gap-2">
              <button onClick={resetChat} className="text-xs text-forest-700 hover:text-forest-900">New chat</button>
              <button onClick={() => setOpen(false)} className="text-xs text-forest-700">{t("copilot.close")}</button>
            </div>
          </div>

          <div className="mb-2">
            <span
              className={`text-[11px] px-2 py-1 rounded-full font-semibold ${
                llmMode === "llm"
                  ? "bg-leaf-100 text-leaf-800"
                  : llmMode === "fallback"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-forest-100 text-forest-800"
              }`}
            >
              {llmMode === "llm" ? "LLM online" : llmMode === "fallback" ? "Fallback mode" : "Runtime unknown"}
            </span>
          </div>

          <div className="h-64 overflow-y-auto rounded-xl border border-forest-100 bg-forest-50/70 p-3 space-y-2 mb-3">
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`text-xs p-2 rounded-lg whitespace-pre-line ${msg.role === "assistant" ? "bg-white text-forest-900" : "bg-forest-100 text-forest-900"}`}>
                {msg.content}
              </div>
            ))}
            {loading ? (
              <div className="text-xs p-2 rounded-lg whitespace-pre-line bg-white text-forest-800">
                Thinking...
              </div>
            ) : null}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="text-[11px] px-2 py-1 rounded-full border border-forest-200 bg-white text-forest-800 hover:bg-forest-50 text-left"
                onClick={() => void ask(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void ask(input);
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-forest-200 text-sm"
              placeholder={t("copilot.askPlaceholder")}
              disabled={loading}
            />
            <button onClick={() => void ask(input)} className="btn-primary !px-3 !py-2" disabled={loading}>
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={startVoice} className="btn-secondary !px-3 !py-2 text-xs" disabled={loading}>
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />} {listening ? "Listening..." : t("copilot.voice")}
            </button>
            <button onClick={speakLast} className="btn-secondary !px-3 !py-2 text-xs">
              <Volume2 className="h-4 w-4" /> {t("copilot.read")}
            </button>
          </div>
          {voiceError ? <p className="mt-2 text-xs text-rose-700">{voiceError}</p> : null}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-primary rounded-full px-4 py-3 shadow-xl pulse-glow">{t("copilot.openButton")}</button>
      )}
    </div>
  );
}

import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { runCopilot, type CopilotMessage } from "../services/copilotService";

type SpeechRecognitionType = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
};

type WindowWithSpeech = Window & typeof globalThis & {
  webkitSpeechRecognition?: new () => SpeechRecognitionType;
};

export default function CopilotWidget() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    { role: "assistant", content: t("copilot.greeting") },
  ]);

  const isHindi = i18n.language.toLowerCase().startsWith("hi");

  const recognition = useMemo(() => {
    const maybeWindow = window as WindowWithSpeech;
    if (!maybeWindow.webkitSpeechRecognition) {
      return null;
    }

    const r = new maybeWindow.webkitSpeechRecognition();
    r.lang = isHindi ? "hi-IN" : "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    return r;
  }, [isHindi]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const answer = runCopilot(trimmed, i18n.language);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: answer }]);
    setInput("");
  };

  const startVoice = () => {
    if (!recognition) return;
    setListening(true);
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      if (text) {
        setInput(text);
      }
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.start();
  };

  const speakLast = () => {
    const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant");
    if (!lastAssistant) return;

    const utterance = new SpeechSynthesisUtterance(lastAssistant.content);
    utterance.lang = isHindi ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      {open ? (
        <div className="w-[340px] max-w-[90vw] surface-card-strong p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-forest-900">{t("copilot.title")}</h3>
            <button onClick={() => setOpen(false)} className="text-xs text-forest-700">{t("copilot.close")}</button>
          </div>

          <div className="h-64 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2 mb-3">
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`text-xs p-2 rounded-lg whitespace-pre-line ${msg.role === "assistant" ? "bg-white text-forest-900" : "bg-forest-100 text-forest-900"}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask(input);
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
              placeholder={t("copilot.askPlaceholder")}
            />
            <button onClick={() => ask(input)} className="btn-primary !px-3 !py-2"><Send className="h-4 w-4" /></button>
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={startVoice} className="btn-secondary !px-3 !py-2 text-xs" disabled={!recognition || listening}>
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />} {t("copilot.voice")}
            </button>
            <button onClick={speakLast} className="btn-secondary !px-3 !py-2 text-xs">
              <Volume2 className="h-4 w-4" /> {t("copilot.read")}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-primary rounded-full px-4 py-3 shadow-xl pulse-glow">{t("copilot.openButton")}</button>
      )}
    </div>
  );
}

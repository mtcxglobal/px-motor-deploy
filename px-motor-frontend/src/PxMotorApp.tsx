import React, { useState } from "react";

const API_BASE_URL = "https://px-motor-backend.onrender.com";
// Roller
type Role = "user" | "assistant";

// Oturum modları
type SessionMode = "px_bina" | "general";

// Mesaj tipi
interface Message {
  role: Role;
  content: string;
}

// Oturum tipi
interface Session {
  id: string;
  title: string;
  mode: SessionMode;
  messages: Message[];
}

// İlk, kalıcı PX-Bina oturumu
const createInitialSessions = (): Session[] => [
  {
    id: "px-bina-main",
    title: "PX Bina · Kalıcı",
    mode: "px_bina",
    messages: [
      {
        role: "assistant",
        content:
          "PX Bina Motoru aktif. Bu oturum bina davranışı ve güvenliği için kalıcı referans oturumudur. Bina ile ilgili teknik tariflerini burada yazmaya başlayabilirsin.",
      },
    ],
  },
];

function PxMotorApp() {
  // STATE
  const [sessions, setSessions] = useState<Session[]>(createInitialSessions());
  const [activeSessionId, setActiveSessionId] =
    useState<string>("px-bina-main");
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showNewSessionMenu, setShowNewSessionMenu] =
    useState<boolean>(false);
  const [pendingSessionMode, setPendingSessionMode] =
    useState<SessionMode | null>(null);
  const [pendingSessionName, setPendingSessionName] = useState<string>("");
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  // Mesaj gönder
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSession || isSending) return;

    const content = input.trim();
    setInput("");

    const userMessage: Message = { role: "user", content };

    // Kullanıcı mesajını hemen ekle
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      )
    );

    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/px-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: activeSession.id,
          mode: activeSession.mode,
          messages: [{ role: "user", content }],
        }),
      });

      if (!response.ok) {
        throw new Error(`PX backend hata: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data?.reply?.content ??
          data?.reply ??
          "PX Motoru bir yanıt döndüremedi.",
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSession.id
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        )
      );
    } catch (error) {
      console.error("PX Backend hata:", error);
      const errorMsg: Message = {
        role: "assistant",
        content: "PX Motoru ile bağlantı kurulamadı. Backend çalışıyor mu?",
      };
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSession.id
            ? { ...session, messages: [...session.messages, errorMsg] }
            : session
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Yeni oturum başlatma – sadece modalı aç
  const startNewSession = (mode: SessionMode) => {
    setShowNewSessionMenu(false);
    setPendingSessionMode(mode);
    setPendingSessionName("");
  };

  // Yeni oturumu gerçekten oluştur
  const handleConfirmCreateSession = () => {
    if (!pendingSessionMode) return;

    const mode = pendingSessionMode;
    const customName = pendingSessionName.trim();

    const id = `${mode}-${Date.now()}`;

    const prefix = mode === "px_bina" ? "PX Oturumu" : "Genel Oturum";
    const title = customName ? `${prefix} - ${customName}` : prefix;

    const intro: Message =
      mode === "px_bina"
        ? {
            role: "assistant",
            content:
              "Yeni bir PX bina oturumu açıldı. Bu oturum, PX Bina Motorunun tam bağlamıyla çalışır ve ilgili bina/konu adı sekme başlığında görünür.",
          }
        : {
            role: "assistant",
            content:
              "Genel bir PX oturumu açtın. Bu oturumda bina dışındaki soruları ve kavramsal tartışmaları güvenli PX çerçevesinde yapabilirsin.",
          };

    const newSession: Session = {
      id,
      title,
      mode,
      messages: [intro],
    };

    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(id);
    setPendingSessionMode(null);
    setPendingSessionName("");
  };

  const handleCancelNewSession = () => {
    setPendingSessionMode(null);
    setPendingSessionName("");
  };

  // Oturum sil (kalıcı PX hariç)
  const handleCloseSession = (id: string) => {
    if (id === "px-bina-main") return;

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId("px-bina-main");
      }
      return filtered;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Üst bar */}
      <header className="border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between bg-slate-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/30 via-slate-900 to-cyan-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(45,212,191,0.45)]">
            <span className="text-xs font-semibold tracking-[0.18em]">PX</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.32em] uppercase text-slate-300">
              PX Bina Motoru
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.24em]">
              Güvenli Chat Oturumu
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="hidden sm:inline-flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="uppercase tracking-[0.2em]">LAB · v1</span>
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNewSessionMenu((v) => !v)}
              className="text-[11px] px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-400 hover:bg-slate-900 transition-all"
            >
              Yeni Oturum
            </button>
            {showNewSessionMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-800 bg-slate-950/95 shadow-lg text-[11px] z-20">
                <button
                  type="button"
                  onClick={() => startNewSession("px_bina")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-900/90 border-b border-slate-800/80 uppercase tracking-[0.16em]"
                >
                  Yeni PX Oturumu
                </button>
                <button
                  type="button"
                  onClick={() => startNewSession("general")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-900/90 uppercase tracking-[0.16em]"
                >
                  Yeni Genel Oturum
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Oturum sekmeleri */}
      <div className="border-b border-slate-900/80 bg-slate-950/80 px-3 sm:px-6 py-2 flex flex-wrap gap-2 overflow-x-auto">
        {sessions.map((session) => {
          const isActive = session.id === activeSession.id;
          const isMainPxBina = session.id === "px-bina-main";

          return (
            <div
              key={session.id}
              onContextMenu={(e) => {
                if (!isMainPxBina) {
                  e.preventDefault();
                  setSessionToDelete(session.id);
                }
              }}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] whitespace-nowrap transition-all ${
                isActive
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.45)]"
                  : "border-slate-700/70 bg-slate-900/80 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveSessionId(session.id)}
                className="flex items-center gap-2"
              >
                <span className="uppercase tracking-[0.14em]">
                  {session.title}
                </span>
                {isMainPxBina && (
                  <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300">
                    Kalıcı
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Yeni oturum isimlendirme paneli */}
      {pendingSessionMode && (
        <div className="bg-slate-950/95 border-b border-slate-900/80 px-3 sm:px-6 py-2 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-[11px]">
          <div className="flex-1 flex flex-wrap items-center gap-2 text-slate-300">
            <span className="uppercase tracking-[0.16em] text-slate-500">
              {pendingSessionMode === "px_bina"
                ? "PX Oturumu"
                : "Genel Oturum"}
            </span>
            <span className="text-slate-500">-</span>
            <input
              type="text"
              value={pendingSessionName}
              onChange={(e) => setPendingSessionName(e.target.value)}
              className="min-w-[180px] max-w-xs flex-1 rounded-lg bg-slate-900/80 border border-slate-700/80 px-2 py-1 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/60 text-[11px]"
              placeholder={
                pendingSessionMode === "px_bina"
                  ? "Örn: 201 nolu Çiçek Apt"
                  : "Örn: Yerçekimi nedir?"
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelNewSession}
              className="px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900 transition-all"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirmCreateSession}
              className="px-4 py-1 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-semibold tracking-[0.16em] uppercase shadow-[0_0_14px_rgba(16,185,129,0.6)] transition-all"
            >
              Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Chat alanı */}
      <main className="flex-1 flex flex-col items-center">
        <div className="relative flex-1 w-full max-w-3xl px-3 sm:px-6 py-4 flex flex-col gap-3">
          {/* Arka plan ışık efekti */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -top-32 -left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-[-120px] right-[-40px] w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex-1 border border-slate-800/80 rounded-2xl bg-slate-950/90 shadow-[0_22px_60px_rgba(15,23,42,0.95)] flex flex-col">
            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {activeSession?.messages.map((m, idx) => (
                <ChatBubble key={idx} role={m.role} content={m.content} />
              ))}
              {!activeSession?.messages.length && (
                <div className="h-full flex items-center justify-center text-[11px] text-slate-500 text-center px-6">
                  Bu oturum için henüz mesaj yok. Aşağıya ilk notunu yazarak PX
                  Motoru ile konuşmaya başlayabilirsin.
                </div>
              )}
            </div>

            {/* Giriş alanı */}
            <form
              onSubmit={handleSend}
              className="border-t border-slate-800/80 p-3 sm:p-4 bg-slate-950/95 flex flex-col gap-2"
            >
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1200}
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 px-3 py-2 text-xs sm:text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/60 placeholder:text-slate-600 resize-none"
                placeholder={
                  activeSession.mode === "px_bina"
                    ? "Örn: 'Zemin katta C3 kolonunda sürekli hafif titreşim var, bu taşıyıcı için risk midir?'"
                    : "Genel bir soru sorabilir veya kavramsal tartışma başlatabilirsin."
                }
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] text-slate-500">
                  Bu chat alanı doğrudan LLM ile konuşmaz; tüm trafik güvenli
                  PX-API katmanı üzerinden yönlendirilir.
                </p>
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500/90 hover:bg-emerald-400 px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase shadow-[0_0_20px_rgba(16,185,129,0.55)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSending ? "Yanıt Bekleniyor…" : "Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Sağ tık silme onay modali */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-950/95 shadow-2xl p-4 space-y-3 text-sm">
            <p className="text-slate-100 text-[13px]">
              Bu oturumu silmek istiyor musun?
            </p>
            <p className="text-[11px] text-slate-400">
              Sağ tıkla seçtiğin oturumun konuşma kaydı bu arayüzden
              kaldırılacak.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-3 py-1 rounded-full border border-slate-600 text-[11px] text-slate-200 hover:bg-slate-900 transition-all"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCloseSession(sessionToDelete);
                  setSessionToDelete(null);
                }}
                className="px-4 py-1 rounded-full bg-red-500/90 hover:bg-red-400 text-[11px] text-slate-950 font-semibold tracking-[0.16em] uppercase shadow-[0_0_14px_rgba(248,113,113,0.7)] transition-all"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatBubbleProps {
  role: Role;
  content: string;
}

function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm leading-relaxed border ${
          isUser
            ? "bg-emerald-500/90 text-slate-950 border-emerald-400/70 rounded-br-sm"
            : "bg-slate-800/80 text-slate-50 border-slate-700/80 rounded-bl-sm"
        }`}
      >
        <p
          className={`text-[9px] uppercase tracking-[0.22em] mb-1 ${
            isUser ? "text-slate-900/70" : "text-emerald-300"
          }`}
        >
          {isUser ? "Operatör" : "PX Motor"}
        </p>
        <p>{content}</p>
      </div>
    </div>
  );
}

export default PxMotorApp;

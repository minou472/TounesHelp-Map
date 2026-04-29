import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { sendChatbotMessage } from "../../../lib/backendApi";

type Message = {
  role: "user" | "bot";
  text: string;
  timestamp: Date;
};

export function AdminChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Bonjour ! Je suis le chatbot TounesHelp. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(
    () => `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      text: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatbotMessage(sessionId, userMessage.text, "fr");
      const botMessage: Message = {
        role: "bot",
        text: response.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "bot",
        text: "Désolé, une erreur est survenue. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C1C1E]">Chatbot</h2>
        <p className="text-gray-600">
          Tester et gérer le chatbot TounesHelp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1C1E]">
                TounesHelp Bot
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                En ligne
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "bot"
                      ? "bg-[#C0392B]"
                      : "bg-blue-500"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <Bot size={16} className="text-white" />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-[#1C1C1E] rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === "user"
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C0392B] flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Tapez votre message..."
                className="h-12 rounded-xl"
                disabled={loading}
              />
              <Button
                onClick={() => void handleSend()}
                disabled={!input.trim() || loading}
                className="bg-[#C0392B] hover:bg-[#A02E24] text-white h-12 w-12 rounded-xl p-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-[#1C1C1E] mb-3">
              Informations du bot
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Session ID</span>
                <span className="text-[#1C1C1E] font-mono text-xs truncate max-w-[140px]">
                  {sessionId.slice(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Messages</span>
                <span className="text-[#1C1C1E] font-semibold">
                  {messages.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Langue</span>
                <span className="text-[#1C1C1E]">Français</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-[#1C1C1E] mb-3">
              Questions fréquentes
            </h3>
            <div className="space-y-2">
              {[
                "Comment signaler un cas ?",
                "Quelles sont les régions les plus touchées ?",
                "Comment devenir bénévole ?",
                "Comment fonctionne TounesHelp ?",
              ].map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

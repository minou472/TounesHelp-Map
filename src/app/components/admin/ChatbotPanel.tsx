import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Bot, User, Minimize2, Maximize2, X } from 'lucide-react';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  links?: { text: string; url: string }[];
};

const quickQuestions = [
  "Qu'est-ce que TounesHelpMap ?",
  "Comment soumettre un cas ?",
  "Vérifier le statut d'un cas",
  "Quels sont les gouvernorats couverts ?",
];

const knowledgeBase: Record<string, { response: string; links?: { text: string; url: string }[] }> = {
  "qu'est-ce que touneshelp": {
    response: "TounesHelpMap est une plateforme humanitaire tunisienne qui connecte les communautés dans le besoin avec des ONG, des bénévoles et des donateurs. Nous facilitons la signalisation, le suivi et la résolution de cas d'urgence à travers toute la Tunisie.",
  },
  "comment soumettre": {
    response: "Pour soumettre un cas : 1) Cliquez sur 'Signaler un cas' 2) Remplissez le formulaire avec les détails 3) Ajoutez des photos si possible 4) Indiquez la localisation précise 5) Soumettez pour révision. Notre équipe examine chaque cas sous 24-48h.",
    links: [{ text: "Créer un nouveau cas", url: "/creer-cas" }],
  },
  "statut": {
    response: "Les statuts de cas sont : 🔴 'Souffre encore' (nouveau/en attente), 🟠 'En cours d'aide' (aide en cours), 🟢 'Résolu' (cas résolu). Vous pouvez vérifier le statut de votre cas dans votre tableau de bord utilisateur.",
    links: [{ text: "Voir tous les cas", url: "/cas" }],
  },
  "gouvernorats": {
    response: "TounesHelpMap couvre les 24 gouvernorats de Tunisie : Tunis, Ariana, Ben Arous, Manouba, Bizerte, Nabeul, Zaghouan, Béja, Jendouba, Le Kef, Siliana, Sousse, Monastir, Mahdia, Sfax, Kairouan, Kasserine, Sidi Bouzid, Gabès, Médenine, Tataouine, Gafsa, Tozeur, et Kébili.",
  },
  "approbation": {
    response: "Le processus d'approbation : 1) Soumission du cas 2) Vérification par modérateur (24-48h) 3) Validation ou demande d'info supplémentaire 4) Publication sur la carte 5) Suivi continu. Les cas urgents sont priorisés.",
  },
  "contact": {
    response: "Pour contacter une personne dans le besoin, cliquez sur 'Voir le cas' puis utilisez les informations de contact affichées (téléphone, email). Nous recommandons d'appeler d'abord pour vérifier les besoins actuels.",
  },
  "photos": {
    response: "Pour ajouter des photos : utilisez le formulaire de création de cas, section 'Photos et documents'. Formats acceptés : JPG, PNG, PDF. Taille max : 5 MB par fichier. Les photos aident à la validation rapide.",
  },
  "helper": {
    response: "Pour devenir bénévole : 1) Créez un compte 2) Complétez votre profil 3) Indiquez vos compétences 4) Parcourez les cas dans votre région 5) Contactez directement ou proposez votre aide via la plateforme.",
  },
  "gps": {
    response: "Les coordonnées GPS sont affichées sur chaque fiche de cas. Vous pouvez cliquer sur 'Obtenir l'itinéraire' pour ouvrir Google Maps et naviguer vers le lieu exact.",
    links: [{ text: "Voir la carte", url: "/carte" }],
  },
  "update": {
    response: "Pour mettre à jour votre cas soumis : 1) Connectez-vous 2) Accédez à votre tableau de bord 3) Cliquez sur le cas à modifier 4) Utilisez 'Modifier' 5) Sauvegardez. Les modifications sont soumises à révision.",
    links: [{ text: "Mon tableau de bord", url: "/dashboard" }],
  },
};

function getBotResponse(userMessage: string): { response: string; links?: { text: string; url: string }[] } {
  const normalizedMessage = userMessage.toLowerCase();
  
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (normalizedMessage.includes(key)) {
      return value;
    }
  }

  return {
    response: "Je ne suis pas sûr de comprendre votre question. Voici ce que je peux vous aider : informations sur la plateforme, soumission de cas, statuts, gouvernorats couverts, et plus. Posez-moi une question spécifique !",
  };
}

interface ChatbotPanelProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export function ChatbotPanel({ isFloating = false, onClose }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Bonjour ! Je suis l'assistant TounesHelp. Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse.response,
        sender: 'bot',
        timestamp: new Date(),
        links: botResponse.links,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (isFloating && isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1E88E5] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1976D2] transition-colors z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  const containerClasses = isFloating
    ? "fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl rounded-2xl z-50"
    : "w-full h-[calc(100vh-180px)] rounded-xl";

  return (
    <Card className={`${containerClasses} bg-white border border-[#E2E8F0] flex flex-col overflow-hidden`}>
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#1976D2] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold">TounesHelp Assistant</h3>
            <p className="text-xs opacity-90">En ligne • Temps de réponse rapide</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFloating && (
            <>
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:bg-white/20 p-1.5 rounded"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="hover:bg-white/20 p-1.5 rounded"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 bg-[#F5F7FA] border-b border-[#E2E8F0]">
          <p className="text-xs text-[#718096] mb-2">Questions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-full text-xs text-[#1A202C] hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-[#1E88E5]' : 'bg-[#E2E8F0]'
              }`}
            >
              {message.sender === 'user' ? (
                <User size={16} className="text-white" />
              ) : (
                <Bot size={16} className="text-[#718096]" />
              )}
            </div>
            <div
              className={`max-w-[75%] ${
                message.sender === 'user' ? 'items-end' : 'items-start'
              } flex flex-col gap-1`}
            >
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-[#1E88E5] text-white rounded-tr-none'
                    : 'bg-[#F5F7FA] text-[#1A202C] rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              {message.links && (
                <div className="flex flex-col gap-1 mt-1">
                  {message.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      className="text-xs text-[#1E88E5] underline hover:text-[#1976D2]"
                    >
                      → {link.text}
                    </a>
                  ))}
                </div>
              )}
              <span className="text-xs text-[#718096] px-1">
                {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#E2E8F0]">
              <Bot size={16} className="text-[#718096]" />
            </div>
            <div className="bg-[#F5F7FA] px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#718096] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#718096] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#718096] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#E2E8F0] bg-white">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 border-[#E2E8F0] focus:border-[#1E88E5]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-[#1E88E5] hover:bg-[#1976D2] text-white"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

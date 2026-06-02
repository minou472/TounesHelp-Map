import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, X, Minimize2, Globe } from 'lucide-react';

import type { TunisiaCase } from '../../data/tunisiaData';
import { fetchCases } from '../../lib/backendApi';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  links?: { text: string; url: string }[];
};

type Language = 'fr' | 'ar' | 'en';

const translations = {
  fr: {
    greeting: "Bonjour! 🐰💕 Je suis Espoir, votre assistant TounesHelp! Comment puis-je vous aider aujourd'hui?",
    placeholder: "Tapez votre message...",
    suggestionsTitle: "Questions rapides:",
    suggestions: [
      "Comment s'inscrire?",
      "Comment créer un cas?",
      "Voir les cas actifs",
      "Vérifier statut d'un cas"
    ],
    typing: "Espoir est en train d'écrire..."
  },
  ar: {
    greeting: "مرحبا! 🐰💕 أنا أمل، مساعدك في TounesHelp! كيف يمكنني مساعدتك اليوم؟",
    placeholder: "اكتب رسالتك...",
    suggestionsTitle: "أسئلة سريعة:",
    suggestions: [
      "كيف أسجل؟",
      "كيف أنشئ حالة؟",
      "عرض الحالات النشطة",
      "التحقق من حالة"
    ],
    typing: "أمل تكتب..."
  },
  en: {
    greeting: "Hello! 🐰💕 I'm Espoir, your TounesHelp assistant! How can I help you today?",
    placeholder: "Type your message...",
    suggestionsTitle: "Quick questions:",
    suggestions: [
      "How to register?",
      "How to create a case?",
      "View active cases",
      "Check case status"
    ],
    typing: "Espoir is typing..."
  }
};

const knowledgeBase = {
  fr: {
    subscribe: {
      response: "Pour vous inscrire sur TounesHelp:\n\n1️⃣ Cliquez sur 'Connexion' en haut à droite\n2️⃣ Sélectionnez 'Créer un compte'\n3️⃣ Remplissez vos informations (nom, email, téléphone)\n4️⃣ Choisissez votre rôle (Personne dans le besoin, Bénévole, ONG)\n5️⃣ Validez votre email\n\n✨ C'est gratuit et rapide!",
      links: [{ text: "S'inscrire maintenant", url: "/auth/register" }]
    },
    createCase: {
      response: "Pour créer un cas sur TounesHelp:\n\n📝 Étapes:\n1️⃣ Connectez-vous à votre compte\n2️⃣ Cliquez sur 'Signaler un cas'\n3️⃣ Remplissez le formulaire:\n   • Titre du cas\n   • Catégorie (Médical, Éducation, Logement...)\n   • Description détaillée\n   • Photos (si possible)\n   • Localisation précise\n4️⃣ Ajoutez vos coordonnées\n5️⃣ Soumettez pour révision\n\n⏱️ Votre cas sera examiné sous 24-48h",
      links: [{ text: "Créer un cas", url: "/post" }]
    },
    activeCases: {
      response: "Je peux vous afficher les statistiques des cas actifs en temps réel. Demandez: \"statistiques\" ou \"cas actifs\".",
      links: [{ text: "Voir tous les cas", url: "/" }]
    },
    help: {
      response: "Je peux vous aider avec:\n\n💡 Informations sur la plateforme\n📝 Inscription et création de cas\n📊 Statistiques des cas actifs\n🔍 Recherche de cas spécifiques\n📍 Cas par gouvernorat\n🏥 Cas par catégorie\n\nPosez-moi une question!"
    }
  },
  ar: {
    subscribe: {
      response: "للتسجيل في TounesHelp:\n\n1️⃣ انقر على 'تسجيل الدخول' في الأعلى\n2️⃣ اختر 'إنشاء حساب'\n3️⃣ املأ معلوماتك (الاسم، البريد الإلكتروني، الهاتف)\n4️⃣ اختر دورك (شخص محتاج، متطوع، منظمة)\n5️⃣ تحقق من بريدك الإلكتروني\n\n✨ مجاني وسريع!",
      links: [{ text: "سجل الآن", url: "/auth/register" }]
    },
    createCase: {
      response: "لإنشاء حالة في TounesHelp:\n\n📝 الخطوات:\n1️⃣ سجل دخولك\n2️⃣ انقر على 'الإبلاغ عن حالة'\n3️⃣ املأ النموذج:\n   • عنوان الحالة\n   • الفئة (طبي، تعليم، إسكان...)\n   • وصف مفصل\n   • صور (إن أمكن)\n   • الموقع الدقيق\n4️⃣ أضف معلومات الاتصال\n5️⃣ قدم للمراجعة\n\n⏱️ سيتم مراجعة حالتك في 24-48 ساعة",
      links: [{ text: "إنشاء حالة", url: "/post" }]
    },
    activeCases: {
      response: "يمكنني عرض إحصائيات الحالات النشطة في الوقت الحقيقي. اطلب: \"إحصائيات\" أو \"حالات نشطة\".",
      links: [{ text: "عرض جميع الحالات", url: "/" }]
    },
    help: {
      response: "يمكنني مساعدتك في:\n\n💡 معلومات عن المنصة\n📝 التسجيل وإنشاء الحالات\n📊 إحصائيات الحالات النشطة\n🔍 البحث عن حالات محددة\n📍 الحالات حسب الولاية\n🏥 الحالات حسب الفئة\n\nاسألني سؤالاً!"
    }
  },
  en: {
    subscribe: {
      response: "To register on TounesHelp:\n\n1️⃣ Click 'Login' at top right\n2️⃣ Select 'Create account'\n3️⃣ Fill in your information (name, email, phone)\n4️⃣ Choose your role (Person in need, Volunteer, NGO)\n5️⃣ Verify your email\n\n✨ It's free and quick!",
      links: [{ text: "Register now", url: "/auth/register" }]
    },
    createCase: {
      response: "To create a case on TounesHelp:\n\n📝 Steps:\n1️⃣ Log into your account\n2️⃣ Click 'Report a case'\n3️⃣ Fill out the form:\n   • Case title\n   • Category (Medical, Education, Housing...)\n   • Detailed description\n   • Photos (if possible)\n   • Precise location\n4️⃣ Add your contact details\n5️⃣ Submit for review\n\n⏱️ Your case will be reviewed within 24-48h",
      links: [{ text: "Create a case", url: "/post" }]
    },
    activeCases: {
      response: "I can show real-time active case statistics. Ask: \"stats\" or \"active cases\".",
      links: [{ text: "View all cases", url: "/" }]
    },
    help: {
      response: "I can help you with:\n\n💡 Platform information\n📝 Registration and case creation\n📊 Active case statistics\n🔍 Search for specific cases\n📍 Cases by governorate\n🏥 Cases by category\n\nAsk me a question!"
    }
  }
};

function getBotResponse(userMessage: string, language: Language, cases: TunisiaCase[]): { response: string; links?: { text: string; url: string }[] } {
  const normalizedMessage = userMessage.toLowerCase();
  const kb = knowledgeBase[language];

  if (normalizedMessage.includes('inscr') || normalizedMessage.includes('سجل') || normalizedMessage.includes('register')) return kb.subscribe;
  if (normalizedMessage.includes('créer') || normalizedMessage.includes('cas') || normalizedMessage.includes('أنشئ') || normalizedMessage.includes('create') || normalizedMessage.includes('case')) return kb.createCase;
  
  if (normalizedMessage.includes('actif') || normalizedMessage.includes('statist')) {
    const suffering = cases.filter(c => c.status === 'suffering').length;
    const helping = cases.filter(c => c.status === 'helping').length;
    const resolved = cases.filter(c => c.status === 'resolved').length;
    return {
      response: language === 'fr' 
        ? `📊 Stats: 🔴 ${suffering} en souffrance, 🟠 ${helping} en cours, 🟢 ${resolved} résolus.`
        : `📊 Stats: 🔴 ${suffering} suffering, 🟠 ${helping} helping, 🟢 ${resolved} resolved.`,
      links: [{ text: "View all", url: "/cas" }]
    };
  }

  return kb.help;
}

export function RabbitChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 1, text: t.greeting, sender: 'bot', timestamp: new Date() }]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    fetchCases({ limit: 200 }).then(setCases).catch(console.error);
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const resp = getBotResponse(userMsg.text, language, cases);
      setMessages(prev => [...prev, { id: Date.now()+1, text: resp.response, sender: 'bot', timestamp: new Date(), links: resp.links }]);
      setIsTyping(false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 z-50 w-20 h-20 bg-white border-2 border-pink-100 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
      >
        <div className="absolute inset-0 bg-pink-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
        <span className="text-4xl relative z-10">🐰</span>
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce z-20">!</div>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)} 
        className="fixed bottom-6 right-6 bg-white border-2 border-pink-100 text-pink-500 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 hover:scale-105 transition-transform"
      >
        <span className="text-2xl">🐰</span> 
        <span className="font-bold text-[#1A1A2E]">Espoir</span>
      </button>
    );
  }


  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl rounded-3xl z-50 bg-white border-2 border-pink-100 flex flex-col overflow-hidden">
      {/* Header - now white */}
      <div className="bg-white border-b border-pink-100 text-pink-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center">
            <span className="text-2xl">🐰</span>
          </div>
          <div>
            <h3 className="font-bold text-[#1A1A2E]">Espoir 💕</h3>
            <p className="text-xs text-gray-400">Assistant TounesHelp</p>
          </div>
        </div>
        <div className="flex gap-1">
           <button onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')} className="hover:bg-pink-50 text-gray-400 p-2 rounded-full transition-colors"><Globe size={18} /></button>
           <button onClick={() => setIsMinimized(true)} className="hover:bg-pink-50 text-gray-400 p-2 rounded-full transition-colors"><Minimize2 size={18} /></button>
           <button onClick={() => setIsOpen(false)} className="hover:bg-pink-50 text-gray-400 p-2 rounded-full transition-colors"><X size={18} /></button>
        </div>
      </div>

      {/* Messages Area - White background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? (language === 'ar' ? 'flex-row' : 'flex-row-reverse') : (language === 'ar' ? 'flex-row-reverse' : 'flex-row')}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.sender === 'user' ? 'bg-[#C0392B]' : 'bg-pink-50 border border-pink-100'}`}>
              {m.sender === 'user' ? <span className="text-white text-sm">👤</span> : <span className="text-lg">🐰</span>}
            </div>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              m.sender === 'user' 
                ? 'bg-[#C0392B] text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-pink-100 shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{m.text}</p>
              {m.links?.map((l, i) => (
                <a key={i} href={l.url} className="block text-xs font-semibold underline mt-2 text-pink-500 hover:text-pink-600">
                  → {l.text}
                </a>
              ))}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center text-xs text-gray-400 animate-pulse ml-11">
            <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex gap-2">
          <Input 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()} 
            placeholder={t.placeholder} 
            className="rounded-full bg-gray-50 border-gray-200 focus:border-pink-300 focus:ring-pink-300" 
          />
          <Button 
            onClick={handleSendMessage} 
            className="rounded-full bg-pink-500 hover:bg-pink-600 h-10 w-10 p-0 shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}


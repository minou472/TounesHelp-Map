import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, X, Minimize2, Heart, Globe } from "lucide-react";
import { sendChatbotMessage } from "../../lib/backendApi";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  links?: { text: string; url: string }[];
};

type Language = "fr" | "ar" | "en";

const translations = {
  fr: {
    greeting:
      "Bonjour! 🐰💕 Je suis Espoir, votre assistant TounesHelp! Comment puis-je vous aider aujourd'hui?",
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
    greeting:
      "مرحبا! 🐰💕 أنا أمل، مساعدك في TounesHelp! كيف يمكنني مساعدتك اليوم؟",
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
    greeting:
      "Hello! 🐰💕 I'm Espoir, your TounesHelp assistant! How can I help you today?",
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
      response:
        "Pour vous inscrire sur TounesHelp:\n\n1️⃣ Cliquez sur 'Connexion' en haut à droite\n2️⃣ Sélectionnez 'Créer un compte'\n3️⃣ Remplissez vos informations (nom, email, téléphone)\n4️⃣ Choisissez votre rôle (Personne dans le besoin, Bénévole, ONG)\n5️⃣ Validez votre email\n\n✨ C'est gratuit et rapide!",
      links: [{ text: "S'inscrire maintenant", url: "/auth/register" }]
    },
    createCase: {
      response:
        "Pour créer un cas sur TounesHelp:\n\n📝 Étapes:\n1️⃣ Connectez-vous à votre compte\n2️⃣ Cliquez sur 'Signaler un cas'\n3️⃣ Remplissez le formulaire:\n   • Titre du cas\n   • Catégorie (Médical, Éducation, Logement...)\n   • Description détaillée\n   • Photos (si possible)\n   • Localisation précise\n4️⃣ Ajoutez vos coordonnées\n5️⃣ Soumettez pour révision\n\n⏱️ Votre cas sera examiné sous 24-48h",
      links: [{ text: "Créer un cas", url: "/post" }]
    },
    activeCases: {
      response:
        'Je peux vous afficher les statistiques des cas actifs en temps réel. Demandez: "statistiques" ou "cas actifs".',
      links: [{ text: "Voir tous les cas", url: "/" }]
    },
    medical: {
      response:
        "Les cas médicaux sont disponibles dans la liste des cas avec filtrage par catégorie.",
      links: [{ text: "Voir cas médicaux", url: "/?category=Médical" }]
    },
    education: {
      response:
        "Les cas éducatifs sont disponibles dans la liste des cas avec filtrage par catégorie.",
      links: [{ text: "Voir cas éducatifs", url: "/?category=Éducation" }]
    },
    help: {
      response:
        "Je peux vous aider avec:\n\n💡 Informations sur la plateforme\n📝 Inscription et création de cas\n📊 Statistiques des cas actifs\n🔍 Recherche de cas spécifiques\n📍 Cas par gouvernorat\n🏥 Cas par catégorie\n\nPosez-moi une question!"
    }
  },
  ar: {
    subscribe: {
      response:
        "للتسجيل في TounesHelp:\n\n1️⃣ انقر على 'تسجيل الدخول' في الأعلى\n2️⃣ اختر 'إنشاء حساب'\n3️⃣ املأ معلوماتك (الاسم، البريد الإلكتروني، الهاتف)\n4️⃣ اختر دورك (شخص محتاج، متطوع، منظمة)\n5️⃣ تحقق من بريدك الإلكتروني\n\n✨ مجاني وسريع!",
      links: [{ text: "سجل الآن", url: "/auth/register" }]
    },
    createCase: {
      response:
        "لإنشاء حالة في TounesHelp:\n\n📝 الخطوات:\n1️⃣ سجل دخولك\n2️⃣ انقر على 'الإبلاغ عن حالة'\n3️⃣ املأ النموذج:\n   • عنوان الحالة\n   • الفئة (طبي، تعليم، إسكان...)\n   • وصف مفصل\n   • صور (إن أمكن)\n   • الموقع الدقيق\n4️⃣ أضف معلومات الاتصال\n5️⃣ قدم للمراجعة\n\n⏱️ سيتم مراجعة حالتك في 24-48 ساعة",
      links: [{ text: "إنشاء حالة", url: "/post" }]
    },
    activeCases: {
      response:
        'يمكنني عرض إحصائيات الحالات النشطة في الوقت الحقيقي. اطلب: "إحصائيات" أو "حالات نشطة".',
      links: [{ text: "عرض جميع الحالات", url: "/" }]
    },
    help: {
      response:
        "يمكنني مساعدتك في:\n\n💡 معلومات عن المنصة\n📝 التسجيل وإنشاء الحالات\n📊 إحصائيات الحالات النشطة\n🔍 البحث عن حالات محددة\n📍 الحالات حسب الولاية\n🏥 الحالات حسب الفئة\n\nاسألني سؤالاً!"
    }
  },
  en: {
    subscribe: {
      response:
        "To register on TounesHelp:\n\n1️⃣ Click 'Login' at top right\n2️⃣ Select 'Create account'\n3️⃣ Fill in your information (name, email, phone)\n4️⃣ Choose your role (Person in need, Volunteer, NGO)\n5️⃣ Verify your email\n\n✨ It's free and quick!",
      links: [{ text: "Register now", url: "/auth/register" }]
    },
    createCase: {
      response:
        "To create a case on TounesHelp:\n\n📝 Steps:\n1️⃣ Log into your account\n2️⃣ Click 'Report a case'\n3️⃣ Fill out the form:\n   • Case title\n   • Category (Medical, Education, Housing...)\n   • Detailed description\n   • Photos (if possible)\n   • Precise location\n4️⃣ Add your contact details\n5️⃣ Submit for review\n\n⏱️ Your case will be reviewed within 24-48h",
      links: [{ text: "Create a case", url: "/post" }]
    },
    activeCases: {
      response:
        'I can show real-time active case statistics. Ask: "stats" or "active cases".',
      links: [{ text: "View all cases", url: "/" }]
    },
    help: {
      response:
        "I can help you with:\n\n💡 Platform information\n📝 Registration and case creation\n📊 Active case statistics\n🔍 Search for specific cases\n📍 Cases by governorate\n🏥 Cases by category\n\nAsk me a question!"
    }
  }
};

function getBotResponse(
  userMessage: string,
  language: Language,
  cases: TunisiaCase[]
): { response: string; links?: { text: string; url: string }[] } {
  const normalizedMessage = userMessage.toLowerCase();
  const kb = knowledgeBase[language];

  // Check for registration/subscribe
  if (
    normalizedMessage.includes("inscr") ||
    normalizedMessage.includes("سجل") ||
    normalizedMessage.includes("register") ||
    normalizedMessage.includes("compte") ||
    normalizedMessage.includes("حساب")
  ) {
    return kb.subscribe;
  }

  // Check for case creation
  if (
    normalizedMessage.includes("créer") ||
    normalizedMessage.includes("cas") ||
    normalizedMessage.includes("أنشئ") ||
    normalizedMessage.includes("حالة") ||
    normalizedMessage.includes("create") ||
    normalizedMessage.includes("case") ||
    normalizedMessage.includes("signaler")
  ) {
    return kb.createCase;
  }

  // Check for active cases / statistics
  if (
    normalizedMessage.includes("actif") ||
    normalizedMessage.includes("voir") ||
    normalizedMessage.includes("نشط") ||
    normalizedMessage.includes("عرض") ||
    normalizedMessage.includes("active") ||
    normalizedMessage.includes("view") ||
    normalizedMessage.includes("statist")
  ) {
    const suffering = cases.filter((c) => c.status === "suffering").length;
    const helping = cases.filter((c) => c.status === "helping").length;
    const resolved = cases.filter((c) => c.status === "resolved").length;
    const total = cases.length;

    if (language === "fr") {
      return {
        response: `📊 Actuellement sur TounesHelp:\n\n🔴 ${suffering} cas en souffrance\n🟠 ${helping} cas en cours d'aide\n🟢 ${resolved} cas résolus\n\n📍 Total: ${total} cas`,
        links: [{ text: "Voir tous les cas", url: "/cas" }]
      };
    }
    if (language === "ar") {
      return {
        response: `📊 حاليا في TounesHelp:\n\n🔴 ${suffering} حالات تعاني\n🟠 ${helping} حالات قيد المساعدة\n🟢 ${resolved} حالات محلولة\n\n📍 المجموع: ${total} حالة`,
        links: [{ text: "عرض جميع الحالات", url: "/cas" }]
      };
    }
    return {
      response: `📊 Currently on TounesHelp:\n\n🔴 ${suffering} suffering cases\n🟠 ${helping} cases being helped\n🟢 ${resolved} resolved cases\n\n📍 Total: ${total} cases`,
      links: [{ text: "View all cases", url: "/cas" }]
    };
  }

  // Check for specific case status by ID
  const caseIdMatch = normalizedMessage.match(
    /#(\d+)|cas (\d+)|حالة (\d+)|case (\d+)/
  );
  if (caseIdMatch) {
    const caseId =
      caseIdMatch[1] || caseIdMatch[2] || caseIdMatch[3] || caseIdMatch[4];
    const caseData = cases.find((c) => c.id === caseId);

    if (caseData) {
      const statusEmoji =
        caseData.status === "suffering"
          ? "🔴"
          : caseData.status === "helping"
            ? "🟠"
            : "🟢";
      const statusText =
        language === "fr"
          ? caseData.status === "suffering"
            ? "Souffre encore"
            : caseData.status === "helping"
              ? "En cours d'aide"
              : "Résolu"
          : language === "ar"
            ? caseData.status === "suffering"
              ? "لا يزال يعاني"
              : caseData.status === "helping"
                ? "قيد المساعدة"
                : "محلول"
            : caseData.status === "suffering"
              ? "Still suffering"
              : caseData.status === "helping"
                ? "Being helped"
                : "Resolved";

      const response =
        language === "fr"
          ? `📋 Cas #${caseId}: ${caseData.title}\n\n${statusEmoji} Statut: ${statusText}\n📍 Localisation: ${caseData.governorate}\n\n${caseData.status === "suffering" ? "Ce cas a besoin d'aide urgente!" : caseData.status === "helping" ? "Ce cas reçoit de l'aide actuellement." : "Ce cas a été résolu avec succès!"}`
          : language === "ar"
            ? `📋 حالة #${caseId}: ${caseData.title}\n\n${statusEmoji} الحالة: ${statusText}\n📍 الموقع: ${caseData.governorate}\n\n${caseData.status === "suffering" ? "هذه الحالة تحتاج مساعدة عاجلة!" : caseData.status === "helping" ? "هذه الحالة تتلقى المساعدة حاليا." : "تم حل هذه الحالة بنجاح!"}`
            : `📋 Case #${caseId}: ${caseData.title}\n\n${statusEmoji} Status: ${statusText}\n📍 Location: ${caseData.governorate}\n\n${caseData.status === "suffering" ? "This case needs urgent help!" : caseData.status === "helping" ? "This case is receiving help." : "This case was resolved successfully!"}`;

      return {
        response,
        links: [
          {
            text:
              language === "fr"
                ? "Voir le cas"
                : language === "ar"
                  ? "عرض الحالة"
                  : "View case",
            url: `/request/${caseId}`
          }
        ]
      };
    }
  }

  // Check for medical cases
  if (
    normalizedMessage.includes("médical") ||
    normalizedMessage.includes("medical") ||
    normalizedMessage.includes("طبي") ||
    normalizedMessage.includes("santé") ||
    normalizedMessage.includes("صحة")
  ) {
    return kb.activeCases;
  }

  // Check for education cases
  if (
    normalizedMessage.includes("éducation") ||
    normalizedMessage.includes("education") ||
    normalizedMessage.includes("تعليم") ||
    normalizedMessage.includes("école") ||
    normalizedMessage.includes("مدرسة")
  ) {
    return kb.activeCases;
  }

  // Default help response
  return kb.help;
}

export function RabbitChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cases, setCases] = useState<TunisiaCase[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { i18n } = useTranslation();
  const language = (i18n.language as Language) || "fr";
  const t = translations[language];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: t.greeting,
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, language]);

  useEffect(() => {
    const load = async () => {
      try {
        setCases(await fetchCases({ limit: 200 }));
      } catch (error) {
        console.error("Failed to load chatbot case data", error);
      }
    };
    void load();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(
      () => {
        const botResponse = getBotResponse(inputValue, language, cases);
        const botMessage: Message = {
          id: Date.now() + 1,
          text: botResponse.response,
          sender: "bot",
          timestamp: new Date(),
          links: botResponse.links
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      },
      1200 + Math.random() * 800
    );
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Ouvrir le chatbot"
      >
        {/* Rabbit holding heart */}
        <div className="relative">
          {/* Pulsing heart effect */}
          <div className="absolute inset-0 bg-pink-300 rounded-full blur-xl opacity-50 animate-pulse" />

          {/* Rabbit container */}
          <div className="relative bg-gradient-to-br from-pink-300 to-pink-400 rounded-full w-20 h-20 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            {/* Rabbit ears */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
              <div className="w-3 h-10 bg-pink-300 rounded-full transform -rotate-12 shadow-lg" />
              <div className="w-3 h-10 bg-pink-300 rounded-full transform rotate-12 shadow-lg" />
            </div>

            {/* Rabbit face */}
            <div className="text-4xl relative z-10">🐰</div>

            {/* Red heart in rabbit's "hands" */}
            <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
              <Heart className="w-6 h-6 fill-red-500 text-red-500 animate-pulse" />
            </div>
          </div>

          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            !
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            Besoin d'aide? 💕
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
          </div>
        </div>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 hover:scale-105 transition-transform"
      >
        <span className="text-2xl">🐰</span>
        <span className="font-medium">Espoir</span>
        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl rounded-3xl z-50 bg-white border-4 border-pink-200 flex flex-col overflow-hidden">
      {/* Header with rabbit theme */}
      <div className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white p-4 flex items-center justify-between relative overflow-hidden">
        {/* Decorative hearts background */}
        <div className="absolute inset-0 opacity-20">
          <Heart className="absolute top-1 left-4 w-4 h-4 fill-white" />
          <Heart className="absolute bottom-2 right-8 w-3 h-3 fill-white" />
          <Heart className="absolute top-8 right-2 w-5 h-5 fill-white" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <div className="w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🐰</span>
            </div>
            <Heart className="absolute -bottom-1 -right-1 w-5 h-5 fill-red-500 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Espoir 💕</h3>
            <p className="text-xs opacity-90">Votre assistant TounesHelp</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {/* Language selector */}
          <div className="relative group">
            <button
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              title="Choisir la langue"
            >
              <Globe size={18} />
            </button>
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col gap-1 min-w-[100px]">
              <button
                onClick={() => i18n.changeLanguage("fr")}
                className={`px-3 py-2 rounded text-sm text-left ${language === "fr" ? "bg-pink-100 text-pink-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => i18n.changeLanguage("ar")}
                className={`px-3 py-2 rounded text-sm text-left ${language === "ar" ? "bg-pink-100 text-pink-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                🇹🇳 العربية
              </button>
              <button
                onClick={() => i18n.changeLanguage("en")}
                className={`px-3 py-2 rounded text-sm text-left ${language === "en" ? "bg-pink-100 text-pink-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Réduire le chatbot"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Fermer le chatbot"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 bg-pink-50 border-b border-pink-100">
          <p className="text-xs text-pink-700 mb-2 font-medium">
            {t.suggestionsTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.suggestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1.5 bg-white border-2 border-pink-200 rounded-full text-xs text-pink-700 hover:bg-pink-100 hover:border-pink-300 transition-colors shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50/30 to-white"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === "user" ? (language === "ar" ? "flex-row" : "flex-row-reverse") : language === "ar" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === "user" ? "bg-[#C0392B]" : "bg-pink-300"
              }`}
            >
              {message.sender === "user" ? (
                <span className="text-white text-sm">👤</span>
              ) : (
                <span className="text-lg">🐰</span>
              )}
            </div>
            <div
              className={`max-w-[75%] ${
                message.sender === "user" ? "items-end" : "items-start"
              } flex flex-col gap-1`}
            >
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-[#C0392B] text-white rounded-tr-none"
                    : "bg-pink-100 text-gray-800 rounded-tl-none border-2 border-pink-200"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {message.text}
                </p>
              </div>
              {message.links && (
                <div className="flex flex-col gap-1 mt-1">
                  {message.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      className="text-xs text-pink-600 underline hover:text-pink-700 font-medium"
                    >
                      → {link.text}
                    </a>
                  ))}
                </div>
              )}
              <span className="text-xs text-gray-500 px-1">
                {message.timestamp.toLocaleTimeString(
                  language === "ar" ? "ar-TN" : "fr-FR",
                  { hour: "2-digit", minute: "2-digit" }
                )}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div
            className={`flex gap-3 ${language === "ar" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-pink-300">
              <span className="text-lg">🐰</span>
            </div>
            <div className="bg-pink-100 px-4 py-3 rounded-2xl rounded-tl-none border-2 border-pink-200">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-pink-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t.placeholder}
            className="flex-1 border-2 border-pink-200 focus:border-pink-400 rounded-full"
            dir={language === "ar" ? "rtl" : "ltr"}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-full w-12 h-12 p-0 shadow-lg disabled:opacity-50"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>

      {/* Decorative hearts at bottom */}
      <div className="absolute bottom-20 left-4 pointer-events-none">
        <Heart className="w-3 h-3 fill-pink-200 text-pink-200 opacity-50" />
      </div>
      <div className="absolute bottom-24 right-8 pointer-events-none">
        <Heart className="w-4 h-4 fill-pink-200 text-pink-200 opacity-50" />
      </div>
    </Card>
  );
}

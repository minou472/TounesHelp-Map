import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { z } from "zod";

const chatbotSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
  language: z.enum(["fr", "ar", "en"]).default("fr"),
});

type IntentResponse = { response: string; links?: string[] };

function generateResponse(message: string, language: string): IntentResponse {
  const msg = message.toLowerCase();

  const responses: Record<string, Record<string, IntentResponse>> = {
    fr: {
      inscription: {
        response: "Pour s'inscrire sur TounesHelp:\n1. Cliquez sur 'S'inscrire'\n2. Remplissez vos informations\n3. Confirmez votre email\n4. Commencez à aider!",
        links: ["/register"],
      },
      cas: {
        response: "Pour créer un cas:\n1. Connectez-vous\n2. Cliquez sur 'Signaler un cas'\n3. Remplissez les détails\n4. Ajoutez des photos\n5. Soumettez pour révision",
        links: ["/cases/new"],
      },
      actif: {
        response: "Je vais chercher les statistiques en temps réel pour vous...",
        links: ["/cases"],
      },
      aide: {
        response: "Je suis Espoir 🐰, votre assistant TounesHelp! Je peux vous aider avec:\n- Voir les cas actifs\n- Comment s'inscrire\n- Comment signaler un cas\n- Statistiques de la plateforme",
      },
    },
    ar: {
      تسجيل: {
        response: "للتسجيل في TounesHelp:\n1. انقر على 'سجل'\n2. أدخل بياناتك\n3. أكد بريدك الإلكتروني\n4. ابدأ المساعدة!",
        links: ["/register"],
      },
      حالة: {
        response: "لإنشاء حالة:\n1. سجل الدخول\n2. انقر على 'إبلاغ عن حالة'\n3. أدخل التفاصيل\n4. أضف الصور\n5. أرسل للمراجعة",
        links: ["/cases/new"],
      },
    },
    en: {
      register: {
        response: "To register on TounesHelp:\n1. Click 'Sign up'\n2. Fill in your details\n3. Confirm your email\n4. Start helping!",
        links: ["/register"],
      },
      case: {
        response: "To create a case:\n1. Log in\n2. Click 'Report a case'\n3. Fill in the details\n4. Add photos\n5. Submit for review",
        links: ["/cases/new"],
      },
    },
  };

  const langResponses = responses[language] || responses.fr;

  for (const [keyword, data] of Object.entries(langResponses)) {
    if (msg.includes(keyword)) return data;
  }

  const defaults: Record<string, string> = {
    fr: "Je suis Espoir 🐰! Je ne comprends pas encore cette question. Essayez: 'inscription', 'créer un cas', 'cas actifs'.",
    ar: "أنا أمل 🐰! لم أفهم السؤال. جرب: 'تسجيل', 'إنشاء حالة'.",
    en: "I'm Hope 🐰! I didn't understand. Try asking about 'registration', 'create a case', or 'active cases'.",
  };

  return { response: defaults[language] || defaults.fr };
}

// POST /api/chatbot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatbotSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const { sessionId, message, language } = parsed.data;
    const { response, links } = generateResponse(message, language);

    // Log chatbot interaction
    await prisma.chatbotLog.create({
      data: { sessionId, userMessage: message, botResponse: response, language },
    });

    return successResponse({ response, links, language });
  } catch (error) {
    console.error("[POST /chatbot]", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/chatbot/logs — admin only (separate route needed for auth)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "50");

    const logs = await prisma.chatbotLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(logs);
  } catch (error) {
    console.error("[GET /chatbot]", error);
    return errorResponse("Internal server error", 500);
  }
}

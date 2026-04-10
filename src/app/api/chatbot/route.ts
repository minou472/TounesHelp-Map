import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { z } from "zod";

const chatbotSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
  language: z.enum(["fr", "ar", "en"]).default("fr")
});

type IntentResponse = { response: string; links?: string[] };

async function loadMessages(language: string) {
  try {
    return (await import(`../../../../i18n/messages/${language}.json`)).default;
  } catch {
    return (await import(`../../../../i18n/messages/fr.json`)).default;
  }
}

function generateResponse(
  message: string,
  language: string,
  messages: any
): IntentResponse {
  const msg = message.toLowerCase();

  const chatbot = messages.chatbot;

  // Keywords for each intent
  const keywords = {
    register:
      language === "fr"
        ? ["inscr", "compte"]
        : language === "ar"
          ? ["سجل", "حساب"]
          : ["register", "sign"],
    createCase:
      language === "fr"
        ? ["créer", "cas", "signaler"]
        : language === "ar"
          ? ["أنشئ", "حالة"]
          : ["create", "case"],
    activeCases:
      language === "fr"
        ? ["actif", "statist"]
        : language === "ar"
          ? ["نشط", "إحصائيات"]
          : ["active", "stats"],
    help:
      language === "fr"
        ? ["aide", "help"]
        : language === "ar"
          ? ["مساعدة"]
          : ["help"]
  };

  if (keywords.register.some((k) => msg.includes(k))) {
    return {
      response: chatbot.register.response,
      links: chatbot.register.links
    };
  }
  if (keywords.createCase.some((k) => msg.includes(k))) {
    return {
      response: chatbot.createCase.response,
      links: chatbot.createCase.links
    };
  }
  if (keywords.activeCases.some((k) => msg.includes(k))) {
    return {
      response: chatbot.activeCases.response,
      links: chatbot.activeCases.links
    };
  }
  if (keywords.help.some((k) => msg.includes(k))) {
    return { response: chatbot.help.response };
  }

  return { response: chatbot.default };
}

// POST /api/chatbot
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatbotSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues.map((e) => e.message).join(", "),
        422
      );
    }

    const { sessionId, message, language } = parsed.data;
    const messages = await loadMessages(language);
    const { response, links } = generateResponse(message, language, messages);

    // Log chatbot interaction
    await prisma.chatbotLog.create({
      data: { sessionId, userMessage: message, botResponse: response, language }
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
      orderBy: { createdAt: "desc" }
    });

    return successResponse(logs);
  } catch (error) {
    console.error("[GET /chatbot]", error);
    return errorResponse("Internal server error", 500);
  }
}

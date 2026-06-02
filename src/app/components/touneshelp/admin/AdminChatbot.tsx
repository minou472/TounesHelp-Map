import { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { MessageSquare } from "lucide-react";


type ChatbotLog = {
  id: string;
  sessionId: string;
  userMessage: string;
  botResponse: string;
  language: string;
  createdAt: string;
};

export function AdminChatbot() {
  const [logs, setLogs] = useState<ChatbotLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/chatbot");
        const payload = await res.json();
        if (payload.success) {
          setLogs(payload.data);
        }
      } catch (error) {
        console.error("Failed to fetch chatbot logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">
            Gestion du Chatbot Espoir 🐰
          </h2>
          <p className="text-gray-500">
            Suivi des interactions entre les utilisateurs et l'assistant intelligent.
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-gray-200 shadow-sm">
        <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C0392B]" />
            <span className="font-semibold">Historique des conversations</span>
          </div>
          <div className="text-sm text-gray-500">
            {logs.length} interactions enregistrées
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Date & Heure</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead className="w-1/3">Message Utilisateur</TableHead>
                <TableHead className="w-1/3">Réponse Bot</TableHead>
                <TableHead>Session ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement des logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucun log de conversation trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                        {log.language}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={log.userMessage}>
                      {log.userMessage}
                    </TableCell>
                    <TableCell className="max-w-xs truncate italic text-gray-600" title={log.botResponse}>
                      {log.botResponse}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-gray-400">
                      {log.sessionId.slice(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Bell, AlertCircle, Users, Clock, CheckCircle } from "lucide-react";
import {
  fetchNotifications,
  type NotificationsResponse,
} from "../../../lib/backendApi";
import { useTranslation } from "react-i18next";

export function AdminNotifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] =
    useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0392B] mx-auto mb-4" />
          <p className="text-gray-500">{t("admin.notif_loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  const notificationItems = [
    {
      condition: notifications?.details.pendingCasesMessage,
      icon: AlertCircle,
      iconColor: "text-[#C0392B]",
      bgColor: "bg-red-50",
      borderColor: "border-[#C0392B]",
      title: t("admin.notif_pending_cases"),
      message: notifications?.details.pendingCasesMessage,
      count: notifications?.breakdown.pendingCases || 0,
      badgeColor: "bg-[#C0392B]",
    },
    {
      condition: notifications?.details.recentUsersMessage,
      icon: Users,
      iconColor: "text-[#27AE60]",
      bgColor: "bg-green-50",
      borderColor: "border-[#27AE60]",
      title: t("admin.notif_recent_users"),
      message: notifications?.details.recentUsersMessage,
      count: notifications?.breakdown.recentUsers || 0,
      badgeColor: "bg-[#27AE60]",
    },
    {
      condition: notifications?.details.oldCasesMessage,
      icon: Clock,
      iconColor: "text-[#E67E22]",
      bgColor: "bg-orange-50",
      borderColor: "border-[#E67E22]",
      title: t("admin.notif_old_cases"),
      message: notifications?.details.oldCasesMessage,
      count: notifications?.breakdown.oldUnresolvedCases || 0,
      badgeColor: "bg-[#E67E22]",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1C1C1E]">{t("admin.notifications")}</h2>
        <p className="text-gray-600">{t("admin.notifications_desc")}</p>
      </div>

      {/* Summary Card */}
      <Card className="p-6 mb-8 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("admin.notif_total_label")}</p>
              <p className="text-3xl font-bold text-[#1C1C1E]">
                {notifications?.total || 0}
              </p>
            </div>
          </div>
          {notifications && notifications.total > 0 && (
            <Badge className="bg-[#C0392B] text-white px-3 py-1">
              {notifications.total} {t("admin.notif_pending_badge")}
            </Badge>
          )}
        </div>
      </Card>

      {/* Notification Items */}
      <div className="space-y-4">
        {notificationItems
          .filter((n) => n.condition)
          .map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className={`p-6 border-l-4 ${item.borderColor} ${item.bgColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Icon size={28} className={item.iconColor} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-[#1C1C1E]">
                        {item.title}
                      </h3>
                      <Badge className={`${item.badgeColor} text-white`}>
                        {item.count}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{item.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}

        {(!notifications || notifications.total === 0) && (
          <Card className="p-16 text-center">
            <CheckCircle
              size={48}
              className="mx-auto mb-4 text-green-400"
            />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              {t("admin.notif_all_clear_title")}
            </h3>
            <p className="text-gray-400">
              {t("admin.notif_all_clear_desc")}
            </p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

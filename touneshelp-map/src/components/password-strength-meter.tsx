"use client";

import { useTranslations } from "next-intl";
import { checkPasswordStrength } from "@/lib/validations";

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const t = useTranslations("password");
  const tValidation = useTranslations("validation");

  if (!password) {
    return null;
  }

  const { score, label, requirements } = checkPasswordStrength(password);

  const strengthColors = {
    weak: "bg-red-500",
    fair: "bg-yellow-500",
    good: "bg-blue-500",
    strong: "bg-green-500",
  };

  const strengthLabels = {
    weak: t("strength.weak"),
    fair: t("strength.fair"),
    good: t("strength.good"),
    strong: t("strength.strong"),
  };

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= score ? strengthColors[label] : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p
          className={`text-xs font-medium ${
            label === "weak"
              ? "text-red-500"
              : label === "fair"
                ? "text-yellow-500"
                : label === "good"
                  ? "text-blue-500"
                  : "text-green-500"
          }`}
        >
          {strengthLabels[label]}
          {label === "weak" && ` - ${tValidation("passwordTooWeak")}`}
        </p>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
        <RequirementItem
          met={requirements.length}
          label={t("requirements.length")}
        />
        <RequirementItem
          met={requirements.uppercase}
          label={t("requirements.uppercase")}
        />
        <RequirementItem
          met={requirements.lowercase}
          label={t("requirements.lowercase")}
        />
        <RequirementItem
          met={requirements.number}
          label={t("requirements.number")}
        />
        <RequirementItem
          met={requirements.special}
          label={t("requirements.special")}
        />
      </div>
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 ${met ? "text-green-600" : "text-slate-400"}`}
    >
      {met ? (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>{label}</span>
    </div>
  );
}

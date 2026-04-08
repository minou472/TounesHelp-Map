import { Link } from "react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { TunisiaCase } from "../../data/tunisiaData";

interface CaseCardProps {
  case: TunisiaCase;
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  const statusConfig = {
    suffering: {
      label: 'Souffre encore',
      className: 'bg-[#C0392B] text-white',
    },
    helping: {
      label: 'En cours d\'aide',
      className: 'bg-[#E67E22] text-white',
    },
    resolved: {
      label: 'Résolu',
      className: 'bg-[#27AE60] text-white',
    },
  };

  const config = statusConfig[caseData.status];

  return (
    <Card className="w-[340px] flex-shrink-0 overflow-hidden bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:shadow-[0_16px_48px_rgba(192,57,43,0.18)] hover:-translate-y-2 transition-all duration-300">
      {/* Image Area */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={caseData.images[0]}
          alt={caseData.title}
          className="w-full h-full object-cover"
        />
        {/* Status Badge */}
        <Badge className={`absolute top-4 right-4 ${config.className} rounded-full px-3 py-1`}>
          {config.label}
        </Badge>
        {/* Governorate Chip */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#C0392B]" />
          <span className="text-xs font-medium text-[#1C1C1E]">{caseData.governorate}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-bold text-lg text-[#1C1C1E] mb-3 line-clamp-2 min-h-[56px]">
          {caseData.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#6B6B6B] mb-2 line-clamp-3 min-h-[63px]">
          {caseData.description}
        </p>
        <Link
          to={`/cas/${caseData.id}`}
          className="text-sm text-[#C0392B] hover:text-[#A02E24] font-medium"
        >
          Lire plus →
        </Link>

        {/* Divider */}
        <div className="border-t border-[#F0E6D3] my-4" />

        {/* Person Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl">👤</span>
            <div className="flex-1">
              <p className="text-xs text-[#6B6B6B] mb-0.5">Personne concernée</p>
              <p className="text-sm font-medium text-[#1C1C1E]">{caseData.victimName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <Phone size={14} />
            <span className="text-xs">{caseData.victimPhone}</span>
          </div>

          {caseData.victimEmail && (
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <Mail size={14} />
              <span className="text-xs truncate">{caseData.victimEmail}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#F0E6D3] mb-4" />

        {/* Action Button */}
        <Link to={`/cas/${caseData.id}`}>
          <Button className="w-full bg-[#C0392B] hover:bg-[#A02E24] text-white rounded-xl h-12 font-semibold">
            JE VEUX AIDER
          </Button>
        </Link>
      </div>
    </Card>
  );
}

import { Link } from 'react-router';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';

export function AdminDemo() {
  const features = [
    {
      icon: LayoutDashboard,
      title: 'Tableau de bord complet',
      description: 'Métriques en temps réel, graphiques interactifs et aperçu des activités',
      color: 'bg-[#1E88E5]',
      link: '/admin/enhanced',
    },
    {
      icon: Users,
      title: 'Gestion des utilisateurs',
      description: 'Gérer les rôles, statuts et permissions des utilisateurs',
      color: 'bg-[#9C27B0]',
      link: '/admin/enhanced/users',
    },
    {
      icon: MapPin,
      title: 'Lieux & Locations',
      description: 'Carte interactive avec tous les emplacements de cas',
      color: 'bg-[#43A047]',
      link: '/admin/enhanced/places',
    },
    {
      icon: MessageCircle,
      title: 'Chatbot Assistant',
      description: 'Assistant IA pour répondre aux questions sur la plateforme',
      color: 'bg-[#FF9800]',
      link: '/admin/enhanced/chatbot',
    },
  ];

  const specs = [
    'Sidebar collapsible avec navigation intuitive',
    'Métriques en temps réel avec indicateurs de tendance',
    'Graphiques interactifs (Pie, Bar, Line charts)',
    'Gestion complète des utilisateurs avec filtres',
    'Carte interactive Google Maps avec marqueurs',
    'Chatbot avec base de connaissances',
    'Interface responsive (Desktop, Tablet, Mobile)',
    'Design moderne avec palette de couleurs professionnelle',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-[#F5F7FA] to-[#E8F5E9] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <Sparkles className="text-[#FF9800]" size={20} />
            <span className="text-sm font-medium text-[#1A202C]">Nouveau</span>
          </div>
          <h1 className="text-5xl font-bold text-[#1A202C] mb-4">
            Admin Dashboard Amélioré
          </h1>
          <p className="text-xl text-[#718096] max-w-2xl mx-auto">
            Interface d'administration complète pour TounesHelpMap avec tableau de bord interactif, 
            gestion des utilisateurs, carte interactive et chatbot IA
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="p-6 bg-white border border-[#E2E8F0] hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1A202C] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#718096] mb-4">
                      {feature.description}
                    </p>
                    <Link to={feature.link}>
                      <Button variant="outline" size="sm" className="text-[#1E88E5] border-[#1E88E5] hover:bg-[#1E88E5] hover:text-white">
                        Explorer
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Specifications */}
        <Card className="p-8 bg-white border border-[#E2E8F0] mb-8">
          <h2 className="text-2xl font-bold text-[#1A202C] mb-6">
            ✨ Fonctionnalités complètes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="text-[#43A047] flex-shrink-0 mt-0.5" size={20} />
                <span className="text-[#1A202C]">{spec}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Design System */}
        <Card className="p-8 bg-white border border-[#E2E8F0] mb-8">
          <h2 className="text-2xl font-bold text-[#1A202C] mb-6">
            🎨 Système de design
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="w-full h-20 bg-[#1E88E5] rounded-lg mb-2 flex items-center justify-center text-white font-medium">
                Primary
              </div>
              <p className="text-xs text-[#718096]">#1E88E5</p>
            </div>
            <div>
              <div className="w-full h-20 bg-[#43A047] rounded-lg mb-2 flex items-center justify-center text-white font-medium">
                Success
              </div>
              <p className="text-xs text-[#718096]">#43A047</p>
            </div>
            <div>
              <div className="w-full h-20 bg-[#FF9800] rounded-lg mb-2 flex items-center justify-center text-white font-medium">
                Warning
              </div>
              <p className="text-xs text-[#718096]">#FF9800</p>
            </div>
            <div>
              <div className="w-full h-20 bg-[#E53935] rounded-lg mb-2 flex items-center justify-center text-white font-medium">
                Danger
              </div>
              <p className="text-xs text-[#718096]">#E53935</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link to="/admin/enhanced">
            <Button size="lg" className="bg-[#1E88E5] hover:bg-[#1976D2] text-white px-8 py-6 text-lg">
              Accéder au tableau de bord
              <ArrowRight size={24} className="ml-3" />
            </Button>
          </Link>
          <p className="text-sm text-[#718096] mt-4">
            Explorez toutes les fonctionnalités d'administration
          </p>
        </div>
      </div>
    </div>
  );
}

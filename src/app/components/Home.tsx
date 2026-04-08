import { useState } from "react";
import { Link } from "react-router";
import { mockRequests } from "../data/mockData";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  MapPin,
  Clock,
  Users,
  GraduationCap,
  ShoppingCart,
  Car,
  Coffee,
  Smartphone,
  UtensilsCrossed,
  MoreHorizontal,
  Star,
} from "lucide-react";

const categoryIcons = {
  tutoring: GraduationCap,
  food: UtensilsCrossed,
  transportation: Car,
  errands: ShoppingCart,
  companionship: Coffee,
  'tech-help': Smartphone,
  other: MoreHorizontal,
};

const categoryColors = {
  tutoring: 'bg-purple-100 text-purple-700',
  food: 'bg-orange-100 text-orange-700',
  transportation: 'bg-blue-100 text-blue-700',
  errands: 'bg-green-100 text-green-700',
  companionship: 'bg-pink-100 text-pink-700',
  'tech-help': 'bg-cyan-100 text-cyan-700',
  other: 'bg-gray-100 text-gray-700',
};

const urgencyColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: MoreHorizontal },
    { id: 'tutoring', label: 'Tutoring', icon: GraduationCap },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'transportation', label: 'Rides', icon: Car },
    { id: 'errands', label: 'Errands', icon: ShoppingCart },
    { id: 'companionship', label: 'Social', icon: Coffee },
    { id: 'tech-help', label: 'Tech', icon: Smartphone },
  ];

  const filteredRequests = mockRequests.filter((request) => {
    if (selectedCategory !== 'all' && request.category !== selectedCategory) {
      return false;
    }
    if (selectedUrgency !== 'all' && request.urgency !== selectedUrgency) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Help Your Neighbors
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with people in your community who need help or offer your skills to make a difference
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon size={18} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency Filter */}
      <div className="flex gap-4 items-center mb-8">
        <span className="text-sm text-gray-600">Filter by urgency:</span>
        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map((urgency) => (
            <button
              key={urgency}
              onClick={() => setSelectedUrgency(urgency)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                selectedUrgency === urgency
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Help Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((request) => {
          const CategoryIcon = categoryIcons[request.category];
          return (
            <Card key={request.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge className={categoryColors[request.category]}>
                      <CategoryIcon size={14} className="mr-1" />
                      {request.category.replace('-', ' ')}
                    </Badge>
                    <Badge className={urgencyColors[request.urgency]}>
                      {request.urgency}
                    </Badge>
                  </div>
                  {request.status === 'in-progress' && (
                    <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {request.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>{request.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>{request.postedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={16} />
                    <span>
                      {request.helpersConfirmed}/{request.helpersNeeded} helper
                      {request.helpersNeeded > 1 ? 's' : ''} confirmed
                    </span>
                  </div>
                </div>

                {/* Posted By */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.postedBy.avatar} />
                    <AvatarFallback>{request.postedBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/profile/${request.postedBy.id}`}
                      className="font-medium text-sm hover:text-blue-600 block truncate"
                    >
                      {request.postedBy.name}
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star size={12} fill="#FFA500" stroke="#FFA500" />
                      <span>{request.postedBy.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link to={`/request/${request.id}`}>
                  <Button className="w-full">
                    {request.status === 'open' ? 'Offer Help' : 'View Details'}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No requests match your filters</p>
          <Button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedUrgency('all');
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

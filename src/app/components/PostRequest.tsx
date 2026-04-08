import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  GraduationCap,
  ShoppingCart,
  Car,
  Coffee,
  Smartphone,
  UtensilsCrossed,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { toast } from "sonner";

const categories = [
  { id: 'tutoring', label: 'Tutoring', icon: GraduationCap },
  { id: 'food', label: 'Food & Meals', icon: UtensilsCrossed },
  { id: 'transportation', label: 'Transportation', icon: Car },
  { id: 'errands', label: 'Errands & Shopping', icon: ShoppingCart },
  { id: 'companionship', label: 'Companionship', icon: Coffee },
  { id: 'tech-help', label: 'Tech Help', icon: Smartphone },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
];

export function PostRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    urgency: 'medium',
    helpersNeeded: '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Help request posted successfully!');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Post a Help Request</h1>
        <p className="text-gray-600">
          Let your community know how they can help you
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">
              Request Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Need help with grocery shopping"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide details about what kind of help you need..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="mt-2 min-h-[120px]"
            />
            <p className="text-sm text-gray-500 mt-1">
              Be specific about what you need and when you need it
            </p>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Downtown, Main Street"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Urgency & Helpers Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgency */}
            <div>
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Helpers Needed */}
            <div>
              <Label htmlFor="helpers">Helpers Needed</Label>
              <Select value={formData.helpersNeeded} onValueChange={(value) => handleChange('helpersNeeded', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 helper</SelectItem>
                  <SelectItem value="2">2 helpers</SelectItem>
                  <SelectItem value="3">3 helpers</SelectItem>
                  <SelectItem value="4">4+ helpers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for posting</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be clear and specific about what you need</li>
              <li>• Include any time constraints or deadlines</li>
              <li>• Mention if any special skills are required</li>
              <li>• Be respectful and grateful for any help offered</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Send size={18} className="mr-2" />
              Post Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

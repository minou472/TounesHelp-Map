import { useParams, Link, useNavigate } from "react-router";
import { mockRequests } from "../data/mockData";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Star,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [hasOfferedHelp, setHasOfferedHelp] = useState(false);

  const request = mockRequests.find((r) => r.id === id);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">Request not found</p>
        <div className="text-center mt-4">
          <Button onClick={() => navigate('/')}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  const handleOfferHelp = () => {
    if (!message.trim()) {
      toast.error('Please add a message to introduce yourself');
      return;
    }
    setHasOfferedHelp(true);
    toast.success('Your help offer has been sent!');
  };

  const urgencyColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6 -ml-2"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Browse
      </Button>

      <div className="grid gap-6">
        {/* Main Request Card */}
        <Card className="p-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className={urgencyColors[request.urgency]}>
              {request.urgency} priority
            </Badge>
            {request.status === 'in-progress' && (
              <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
            )}
            {request.status === 'completed' && (
              <Badge className="bg-green-100 text-green-700">Completed</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{request.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-6 mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{request.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>Posted {request.postedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>
                {request.helpersConfirmed}/{request.helpersNeeded} helper
                {request.helpersNeeded > 1 ? 's' : ''} needed
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{request.description}</p>
          </div>

          {/* Posted By */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="font-semibold text-lg mb-4">Posted by</h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={request.postedBy.avatar} />
                <AvatarFallback>{request.postedBy.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Link
                  to={`/profile/${request.postedBy.id}`}
                  className="font-semibold text-lg hover:text-blue-600"
                >
                  {request.postedBy.name}
                </Link>
                <div className="flex items-center gap-2 text-gray-600">
                  <Star size={16} fill="#FFA500" stroke="#FFA500" />
                  <span>{request.postedBy.rating} rating</span>
                </div>
              </div>
              <Link to={`/profile/${request.postedBy.id}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Helpers Card */}
        {request.helpers.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Confirmed Helpers
            </h2>
            <div className="space-y-3">
              {request.helpers.map((helper) => (
                <div key={helper.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={helper.avatar} />
                    <AvatarFallback>{helper.name[0]}</AvatarFallback>
                  </Avatar>
                  <Link
                    to={`/profile/${helper.id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {helper.name}
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Offer Help Card */}
        {request.status === 'open' && !hasOfferedHelp && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Offer Your Help
            </h2>
            <p className="text-gray-600 mb-4">
              Send a message to introduce yourself and let them know you'd like to help!
            </p>
            <Textarea
              placeholder="Hi! I'd love to help with this. I have experience with..."
              className="mb-4 min-h-[100px] bg-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleOfferHelp} className="w-full" size="lg">
              Send Help Offer
            </Button>
          </Card>
        )}

        {hasOfferedHelp && (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle size={24} />
              <div>
                <p className="font-semibold">Help offer sent!</p>
                <p className="text-sm">
                  {request.postedBy.name} will be notified and can reach out to you.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

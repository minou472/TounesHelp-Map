import { useParams, useNavigate } from "react-router";
import { mockUsers, mockRequests } from "../data/mockData";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Star,
  Heart,
  HandHelping,
  Calendar,
  MessageCircle,
  MapPin,
  Clock,
} from "lucide-react";
import { Link } from "react-router";

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = mockUsers[id || ''];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">User not found</p>
        <div className="text-center mt-4">
          <Button onClick={() => navigate('/')}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  const userRequests = mockRequests.filter((r) => r.postedBy.id === id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6 -ml-2"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </Button>

      {/* Profile Header Card */}
      <Card className="p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <Avatar className="h-32 w-32">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-lg">
                <Star size={20} fill="#FFA500" stroke="#FFA500" />
                <span className="font-semibold">{user.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Joined {user.joinedDate}</span>
            </div>
            <p className="text-gray-700 mb-6">{user.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <HandHelping size={20} />
                  <span className="font-semibold">Helped</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {user.helpedCount}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Heart size={20} />
                  <span className="font-semibold">Received</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {user.receivedHelpCount}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Calendar size={20} />
                  <span className="font-semibold">Member</span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {user.joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 md:w-48">
            <Button className="w-full">
              <MessageCircle size={18} className="mr-2" />
              Message
            </Button>
            <Button variant="outline" className="w-full">
              Report User
            </Button>
          </div>
        </div>

        {/* Skills */}
        {user.skills.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-3">Skills & Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge key={skill} className="bg-gray-100 text-gray-700">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tabs for Activity */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="requests">
            Posted Requests ({userRequests.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          {userRequests.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No requests posted yet</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userRequests.map((request) => (
                <Card key={request.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {request.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{request.postedAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:w-40">
                      <Badge
                        className={
                          request.status === 'open'
                            ? 'bg-green-100 text-green-700'
                            : request.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {request.status}
                      </Badge>
                      <Link to={`/request/${request.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card className="p-12 text-center">
            <Star size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No reviews yet</p>
            <p className="text-sm text-gray-400">
              Reviews from people who have worked with {user.name.split(' ')[0]} will appear here
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

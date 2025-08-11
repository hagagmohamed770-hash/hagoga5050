import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import type { User } from "@shared/schema";

export default function Team() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"]
  });

  if (isLoading) {
    return (
      <>
        <Header 
          title="Team"
          description="Manage team members and collaboration settings"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Team"
        description="Manage team members and collaboration settings"
        action={
          <Button data-testid="button-invite-member">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        {!users || users.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-6">Start collaborating by inviting your first team member.</p>
              <Button data-testid="button-invite-first-member">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Your First Team Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow" data-testid={`card-user-${user.id}`}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base" data-testid={`text-user-name-${user.id}`}>
                        {user.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{user.role}</p>
                      {user.currentActivity && (
                        <p className="text-xs text-gray-400 mt-1">{user.currentActivity}</p>
                      )}
                    </div>
                    <Badge variant={user.isOnline ? "default" : "secondary"} data-testid={`status-user-${user.id}`}>
                      {user.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" data-testid={`button-message-${user.id}`}>
                      Message
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-profile-${user.id}`}>
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

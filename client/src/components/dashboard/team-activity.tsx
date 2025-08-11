import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TeamActivity, User } from "@shared/schema";

export default function TeamActivity() {
  const { data: activities, isLoading: activitiesLoading } = useQuery<TeamActivity[]>({
    queryKey: ["/api/team-activities"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getUserById = (userId: string) => {
    return users?.find(user => user.id === userId);
  };

  if (activitiesLoading) {
    return (
      <Card className="bg-white rounded-xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Team Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Team Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(!activities || activities.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent team activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const user = getUserById(activity.userId);
              const timeAgo = activity.timestamp ? 
                new Date(activity.timestamp).toLocaleString() : 
                'Unknown time';
              
              return (
                <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{user?.name || 'Unknown User'}</span> {activity.action}
                    </p>
                    {activity.details && (
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-500">{timeAgo}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-sm text-primary hover:text-blue-700 font-medium" data-testid="button-view-all-activity">
          View all activity
        </Button>
      </CardContent>
    </Card>
  );
}

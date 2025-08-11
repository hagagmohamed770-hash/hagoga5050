import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoIcon, Share2, FileDown, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Comment, User } from "@shared/schema";

export default function CollaborationPanel() {
  const isMobile = useIsMobile();
  
  const { data: comments } = useQuery<Comment[]>({
    queryKey: ["/api/comments/recent"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Don't show on mobile devices
  if (isMobile) return null;

  const getUserById = (userId: string) => {
    return users?.find(user => user.id === userId);
  };

  const onlineUsers = users?.filter(user => user.isOnline) || [];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col hidden xl:flex">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Recent Comments */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Comments</h4>
          <div className="space-y-4">
            {(!comments || comments.length === 0) ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent comments</p>
              </div>
            ) : (
              comments.slice(0, 2).map((comment) => {
                const user = getUserById(comment.userId);
                const timeAgo = comment.createdAt ? 
                  new Date(comment.createdAt).toLocaleString() : 
                  'Unknown time';
                
                return (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4" data-testid={`comment-${comment.id}`}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900 text-sm">{user?.name || 'Unknown User'}</span>
                          <span className="text-xs text-gray-500">{timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-blue-700" data-testid={`button-reply-${comment.id}`}>
                            Reply
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700" data-testid={`button-like-${comment.id}`}>
                            <Heart className="w-3 h-3 mr-1" />
                            {comment.likes || 0}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Online Team */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Team Online ({onlineUsers.length})</h4>
          <div className="space-y-3">
            {onlineUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No team members online</p>
              </div>
            ) : (
              onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3" data-testid={`online-user-${user.id}`}>
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.currentActivity && (
                      <p className="text-xs text-gray-500">{user.currentActivity}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-3 bg-primary/5 text-primary hover:bg-primary/10"
              data-testid="button-start-video-call"
            >
              <VideoIcon className="w-4 h-4 mr-3" />
              <span className="text-sm font-medium">Start Video Call</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100"
              data-testid="button-share-dashboard"
            >
              <Share2 className="w-4 h-4 mr-3" />
              <span className="text-sm font-medium">Share Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100"
              data-testid="button-export-report"
            >
              <FileDown className="w-4 h-4 mr-3" />
              <span className="text-sm font-medium">Export Report</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

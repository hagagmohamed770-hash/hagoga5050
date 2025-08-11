import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Share2, Download, MessageCircle, Eye } from "lucide-react";
import type { Report } from "@shared/schema";

export default function Reports() {
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"]
  });

  if (isLoading) {
    return (
      <>
        <Header 
          title="Reports"
          description="Create and manage data reports for your team and clients"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
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
        title="Reports"
        description="Create and manage data reports for your team and clients"
        action={
          <Button data-testid="button-new-report">
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        {!reports || reports.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports created yet</h3>
              <p className="text-gray-600 mb-6">Start creating data reports to share insights with your team and clients.</p>
              <Button data-testid="button-create-first-report">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow" data-testid={`card-report-${report.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2" data-testid={`text-report-title-${report.id}`}>
                        {report.title}
                      </CardTitle>
                      {report.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                      )}
                    </div>
                    {report.isPublic && (
                      <Badge variant="outline" className="ml-2">Public</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span data-testid={`views-${report.id}`}>{report.views || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span data-testid={`comments-${report.id}`}>{report.comments || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" data-testid={`button-share-${report.id}`}>
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-download-${report.id}`}>
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button variant="default" size="sm" data-testid={`button-view-${report.id}`}>
                        View Report
                      </Button>
                    </div>
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

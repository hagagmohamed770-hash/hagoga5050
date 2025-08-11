import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Download, MessageCircle, Eye } from "lucide-react";
import type { Report } from "@shared/schema";

export default function RecentReports() {
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"]
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Reports</CardTitle>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentReports = reports?.slice(0, 3) || [];

  return (
    <Card className="bg-white rounded-xl border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Reports</CardTitle>
          <Button variant="ghost" className="text-primary hover:text-blue-700 text-sm font-medium" data-testid="button-view-all-reports">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No reports created yet</p>
              <Button data-testid="button-create-first-report">
                Create Your First Report
              </Button>
            </div>
          ) : (
            recentReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50" data-testid={`report-item-${report.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900" data-testid={`report-title-${report.id}`}>
                      {report.title}
                    </h4>
                    {report.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span>
                        Created: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span data-testid={`report-views-${report.id}`}>{report.views || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span data-testid={`report-comments-${report.id}`}>{report.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" data-testid={`button-share-report-${report.id}`}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" data-testid={`button-download-report-${report.id}`}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

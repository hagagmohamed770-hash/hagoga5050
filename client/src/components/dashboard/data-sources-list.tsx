import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Cloud, FileText, Server, Plus, MoreVertical } from "lucide-react";
import type { DataSource } from "@shared/schema";

const getIconForType = (type: string) => {
  switch (type) {
    case "postgresql": return <Database className="w-5 h-5 text-primary" />;
    case "api": return <Cloud className="w-5 h-5 text-secondary" />;
    case "csv": return <FileText className="w-5 h-5 text-warning" />;
    default: return <Server className="w-5 h-5 text-primary" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "inactive": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function DataSourcesList() {
  const { data: dataSources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"]
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Connected Data Sources</CardTitle>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Connected Data Sources</CardTitle>
          <Button variant="ghost" className="text-primary hover:text-blue-700 text-sm font-medium" data-testid="button-add-data-source">
            <Plus className="w-4 h-4 mr-1" />
            Add Source
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(!dataSources || dataSources.length === 0) ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No data sources connected</p>
              <Button data-testid="button-connect-first-source">
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Data Source
              </Button>
            </div>
          ) : (
            dataSources.slice(0, 3).map((source) => (
              <div key={source.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50" data-testid={`data-source-item-${source.id}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getIconForType(source.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900" data-testid={`data-source-name-${source.id}`}>
                      {source.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last sync: {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(source.status)} data-testid={`data-source-status-${source.id}`}>
                    {source.status}
                  </Badge>
                  <Button variant="ghost" size="sm" data-testid={`button-data-source-options-${source.id}`}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

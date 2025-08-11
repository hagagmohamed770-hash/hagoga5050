import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Server, Cloud, FileText, Plus } from "lucide-react";
import type { DataSource } from "@shared/schema";

const getIconForType = (type: string) => {
  switch (type) {
    case "postgresql": return <Database className="w-5 h-5" />;
    case "api": return <Cloud className="w-5 h-5" />;
    case "csv": return <FileText className="w-5 h-5" />;
    default: return <Server className="w-5 h-5" />;
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

export default function DataSources() {
  const { data: dataSources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"]
  });

  if (isLoading) {
    return (
      <>
        <Header 
          title="Data Sources"
          description="Manage your connected data integrations"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
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
        title="Data Sources"
        description="Manage your connected data integrations"
        action={
          <Button data-testid="button-add-source">
            <Plus className="w-4 h-4 mr-2" />
            Add Data Source
          </Button>
        }
      />
      <div className="flex-1 overflow-auto p-6">
        {!dataSources || dataSources.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources connected</h3>
              <p className="text-gray-600 mb-6">Get started by connecting your first data source to begin visualizing your data.</p>
              <Button data-testid="button-connect-first-source">
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Data Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id} className="hover:shadow-lg transition-shadow" data-testid={`card-data-source-${source.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getIconForType(source.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base" data-testid={`text-source-name-${source.id}`}>
                          {source.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 capitalize">{source.type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(source.status)} data-testid={`status-${source.id}`}>
                      {source.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Last sync: {source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never'}
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" data-testid={`button-configure-${source.id}`}>
                        Configure
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-sync-${source.id}`}>
                        Sync Now
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CodeIntegration() {
  const { toast } = useToast();

  const codeExample = `# Fetch data from your integrated sources
import requests

# Get authentication token
auth_response = requests.post('/api/auth', {
    'api_key': 'your_api_key',
    'workspace_id': 'workspace_123'
})

# Fetch dashboard data
data_response = requests.get('/api/dashboard/data', {
    'source': 'postgresql_prod',
    'timeframe': '30d',
    'metrics': ['revenue', 'users', 'api_calls']
})

# Process and display results
dashboard_data = data_response.json()
revenue = dashboard_data['revenue']
users = dashboard_data['users']
api_calls = dashboard_data['api_calls']

print(f"Revenue: $" + "{:,.2f}".format(revenue))
print(f"Active Users: {users:,}")
print(f"API Calls: {api_calls:,}")

# Export report for clients
export_response = requests.post('/api/reports/export', {
    'format': 'pdf',
    'template': 'client_summary',
    'data': dashboard_data
})`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExample);
    toast({
      title: "Code copied!",
      description: "The API integration example has been copied to your clipboard.",
    });
  };

  return (
    <Card className="bg-white rounded-xl border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">API Integration Examples</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">JavaScript</Button>
            <Button size="sm" data-testid="button-language-python">Python</Button>
            <Button variant="outline" size="sm">cURL</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
            <code data-testid="code-example">{codeExample}</code>
          </pre>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">Integrate DataSync into your applications with our REST API</p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyCode}
              data-testid="button-copy-code"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-view-docs">
              <ExternalLink className="w-4 h-4 mr-1" />
              Documentation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

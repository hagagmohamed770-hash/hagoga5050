import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
}

export default function DataChart() {
  const { data: chartData, isLoading } = useQuery<ChartData>({
    queryKey: ["/api/charts/usage"]
  });

  // Transform the data for Recharts format
  const transformedData = chartData ? chartData.labels.map((label, index) => ({
    name: label,
    'API Calls': chartData.datasets[0]?.data[index] || 0,
    'Data Queries': chartData.datasets[1]?.data[index] || 0,
  })) : [];

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-12"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Data Usage Analytics</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" data-testid="button-chart-7d">7D</Button>
            <Button size="sm" data-testid="button-chart-30d">30D</Button>
            <Button variant="outline" size="sm" data-testid="button-chart-90d">90D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="API Calls"
                stroke="#0066CC"
                strokeWidth={2}
                dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#0066CC', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Data Queries"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

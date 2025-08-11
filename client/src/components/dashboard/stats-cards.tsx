import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Users, BarChart3, Code } from "lucide-react";
import type { Stats } from "@shared/schema";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"]
  });

  const statsData = [
    {
      title: "Active Data Sources",
      value: stats?.dataSources?.toString() || "0",
      change: "+2",
      changeText: "from last month",
      icon: Database,
      color: "primary",
    },
    {
      title: "Team Members",
      value: stats?.teamMembers?.toString() || "0",
      change: "+1",
      changeText: "new this week",
      icon: Users,
      color: "secondary",
    },
    {
      title: "Active Reports",
      value: stats?.activeReports?.toString() || "0",
      change: "+5",
      changeText: "this week",
      icon: BarChart3,
      color: "accent",
    },
    {
      title: "API Calls Today",
      value: stats?.apiCalls ? (stats.apiCalls >= 1000 ? `${(stats.apiCalls / 1000).toFixed(1)}k` : stats.apiCalls.toString()) : "0",
      change: "-5%",
      changeText: "from yesterday",
      icon: Code,
      color: "warning",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title} className="bg-white rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'primary' ? 'bg-primary/10' :
                stat.color === 'secondary' ? 'bg-secondary/10' :
                stat.color === 'accent' ? 'bg-accent/10' :
                'bg-warning/10'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'primary' ? 'text-primary' :
                  stat.color === 'secondary' ? 'text-secondary' :
                  stat.color === 'accent' ? 'text-accent' :
                  'text-warning'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${
                stat.change.startsWith('+') ? 'text-accent' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-gray-600 ml-1">{stat.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

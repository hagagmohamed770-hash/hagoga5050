import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, Shield, Database, Users, Palette } from "lucide-react";

export default function Settings() {
  const settingsCategories = [
    {
      title: "Notifications",
      description: "Manage your notification preferences",
      icon: <Bell className="w-5 h-5" />,
      items: ["Email notifications", "Push notifications", "Team activity alerts"]
    },
    {
      title: "Security & Privacy",
      description: "Control your security settings",
      icon: <Shield className="w-5 h-5" />,
      items: ["Two-factor authentication", "API access keys", "Data encryption"]
    },
    {
      title: "Data Management",
      description: "Configure data handling preferences",
      icon: <Database className="w-5 h-5" />,
      items: ["Data retention policy", "Export settings", "Backup configuration"]
    },
    {
      title: "Team & Collaboration",
      description: "Manage team settings and permissions",
      icon: <Users className="w-5 h-5" />,
      items: ["Member permissions", "Sharing settings", "Collaboration tools"]
    },
    {
      title: "Appearance",
      description: "Customize your dashboard appearance",
      icon: <Palette className="w-5 h-5" />,
      items: ["Theme selection", "Color preferences", "Layout options"]
    }
  ];

  return (
    <>
      <Header 
        title="Settings"
        description="Manage your account and application preferences"
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsCategories.map((category) => (
              <Card key={category.title} className="hover:shadow-lg transition-shadow" data-testid={`card-settings-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <div key={item} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">{item}</span>
                        <Button variant="ghost" size="sm" data-testid={`button-configure-${item.toLowerCase().replace(/\s+/g, '-')}`}>
                          Configure
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <SettingsIcon className="w-5 h-5" />
                <span>Advanced Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="font-medium text-gray-900">API Rate Limiting</h4>
                    <p className="text-sm text-gray-600">Configure API request rate limits</p>
                  </div>
                  <Button variant="outline" data-testid="button-configure-rate-limiting">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h4 className="font-medium text-gray-900">Webhook Configuration</h4>
                    <p className="text-sm text-gray-600">Set up webhooks for real-time data updates</p>
                  </div>
                  <Button variant="outline" data-testid="button-configure-webhooks">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Data Export</h4>
                    <p className="text-sm text-gray-600">Export all your data and configurations</p>
                  </div>
                  <Button variant="outline" data-testid="button-export-data">
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

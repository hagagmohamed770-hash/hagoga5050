import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">{title}</h2>
          {description && (
            <p className="text-gray-600" data-testid="text-page-description">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search data..."
              className="pl-10 pr-4 py-2 w-64"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          {action || (
            <Button data-testid="button-header-action">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

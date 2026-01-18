import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckSquare, FileText, MessageCircle, Bot } from "lucide-react";

const navItems = [
  { path: "/todo", label: "Todo", icon: CheckSquare },
  { path: "/notes", label: "Notes", icon: FileText },
  { path: "/chat", label: "Community Chat", icon: MessageCircle },
  { path: "/ai", label: "AI Chat", icon: Bot },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Apps</h2>
      </div>
      <Separator />
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

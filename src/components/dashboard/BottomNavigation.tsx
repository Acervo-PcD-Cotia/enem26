import { useNavigate } from "react-router-dom";
import { 
  Flame, 
  Calendar, 
  Brain, 
  BookOpen,
  PenTool 
} from "lucide-react";

interface BottomNavigationProps {
  currentRoute: string;
}

const navItems = [
  { id: "dashboard", label: "Hoje", icon: Flame, path: "/dashboard" },
  { id: "subjects", label: "Trilhas", icon: BookOpen, path: "/subjects" },
  { id: "reviews", label: "Revisões", icon: Brain, path: "/reviews" },
  { id: "calendar", label: "Plano", icon: Calendar, path: "/calendar" },
  { id: "essays", label: "Redação", icon: PenTool, path: "/essays" },
];

export function BottomNavigation({ currentRoute }: BottomNavigationProps) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className={`text-xs ${isActive ? "font-medium" : ""}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

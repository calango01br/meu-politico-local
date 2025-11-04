import { Home, Users, TrendingUp, Sparkles, DollarSign } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const Layout = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/politicians", icon: Users, label: "Parlamentares" },
    { to: "/ranking", icon: TrendingUp, label: "Ranking" },
    { to: "/ai-legislation", icon: Sparkles, label: "IA Legislação" },
    { to: "/transparency", icon: DollarSign, label: "Transparência" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated z-50">
        <div className="max-w-screen-xl mx-auto px-2">
          <ul className="flex justify-around items-center h-16">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center h-full px-2 transition-all duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-6 h-6 transition-transform duration-200 ${
                          isActive ? "scale-110" : ""
                        }`}
                      />
                      <span className="text-xs mt-1 font-medium">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

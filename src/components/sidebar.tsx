"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FiHome,
  FiBook,
  FiImage,
  FiUser,
  FiSettings,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      path: "/",
      name: "Home",
      icon: FiHome,
    },
    {
      path: "/works",
      name: "My Works",
      icon: FiBook,
    },
    {
      path: "/photos",
      name: "My Photos",
      icon: FiImage,
    },
    {
      path: "/profile",
      name: "Profile",
      icon: FiUser,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: FiSettings,
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 right-4 p-2 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </Button>

      {/* Sidebar for desktop */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen min-h-screen w-64 bg-background border-r fixed top-0 left-0 z-40",
          className
        )}
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Daniella Daniel</h2>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center py-3 px-4 text-sm rounded-md hover:bg-accent transition-colors",
                pathname === route.path
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.name}
            </Link>
          ))}
        </div>

        <div className="p-6 border-t">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Daniella Daniel
          </p>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-[250px] bg-background p-6 shadow-xl transition-transform duration-300 z-50",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Daniella Daniel</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSidebar}
            >
              <FiX className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center py-3 px-4 text-sm rounded-md hover:bg-accent transition-colors",
                  pathname === route.path
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <route.icon className="mr-3 h-5 w-5" />
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

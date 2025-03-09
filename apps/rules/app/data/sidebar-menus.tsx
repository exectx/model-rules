import { BookOpen, House, Key, Columns3Cog } from "lucide-react";

export const sidebarMenus = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
  },
  // Define console navigation items
  navMain: [
    {
      title: "Dashboard",
      url: "/console",
      icon: House,
      isActive: true,
    },
    {
      title: "Rules",
      url: "/console/rules",
      icon: Columns3Cog,
      hasSubRoutes: true,
    },
    {
      title: "API Keys",
      url: "/console/keys",
      icon: Key,
    },
    // Optional Documentation link
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
    },
  ],
  // No secondary navigation
  navSecondary: [],
  projects: [],
};

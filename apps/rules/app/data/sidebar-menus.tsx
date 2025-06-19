import {
  BookOpen,
  House,
  Key,
  Columns3Cog,
  LifeBuoy,
  Send,
} from "lucide-react";

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
  navSecondary: [
    {
      title: "Support",
      url: "mailto:support@exectx.run?subject=Modelrules: ",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "mailto:hello@exectx.run?subject=Modelrules Feedback: ",
      icon: Send,
    },
  ],
  projects: [],
};

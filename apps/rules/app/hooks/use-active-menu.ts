import { type LucideIcon } from "lucide-react";
// import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useLocation } from "react-router";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  hasSubRoutes?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function useActiveMenu(items: MenuItem[]) {
  const { pathname } = useLocation();

  // Calculate active items whenever pathname or items change
  const activeItems = useMemo(() => {
    return items.map((item) => {
      let isMainActive = pathname === item.url;
      if (item.hasSubRoutes) {
        isMainActive = pathname.startsWith(item.url);
      }
      const hasActiveChild =
        item.items?.some((subItem) => pathname === subItem.url) || false;

      return {
        ...item,
        isActive: isMainActive || hasActiveChild,
        items: item.items?.map((subItem) => ({
          ...subItem,
          isActive: pathname === subItem.url,
        })),
      };
    });
  }, [pathname, items]);

  return {
    activeItems,
  };
}

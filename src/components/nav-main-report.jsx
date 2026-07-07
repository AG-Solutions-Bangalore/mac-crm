import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const itemVariants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
};

function SubMenuItemsReport({ items, handleLinkClick, location }) {
  const [hoveredSubItem, setHoveredSubItem] = React.useState(null);

  return (
    <div onMouseLeave={() => setHoveredSubItem(null)} className="flex flex-col gap-1 w-full">
      {items?.map((subItem) => {
        const isSubItemActive =
          location.pathname === subItem.url ||
          location.pathname.startsWith(subItem.url + "/");
        return (
          <SidebarMenuSubItem
            key={subItem.title}
            className="relative"
            onMouseEnter={() => setHoveredSubItem(subItem.title)}
          >
            {hoveredSubItem === subItem.title && (
              <motion.div
                layoutId="sidebar-sub-hover-highlight"
                className="sidebar-sub-hover-pill absolute inset-0 rounded-md pointer-events-none z-0"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
            <SidebarMenuSubButton asChild className="relative z-10 w-full">
              <Link
                to={subItem.url}
                onClick={(e) => handleLinkClick(e, false, true)}
                className={`px-3 py-1.5 rounded-md transition-colors duration-200 w-full block ${
                  isSubItemActive
                    ? "sidebar-sub-active-item text-white"
                    : "text-[#A9B4C4] hover:text-white"
                }`}
              >
                {subItem.title}
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </div>
  );
}

export function NavMainReport({ items, openItem, setOpenItem }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = React.useState(null);

  const handleLinkClick = (e, hasSubItems = false, isSubItem = false) => {
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sessionStorage.setItem("sidebarScrollPosition", sidebarContent.scrollTop);
    }
    if (!hasSubItems && !isSubItem) setOpenItem(null);
  };

  React.useEffect(() => {
    const sidebarContent = document.querySelector(".sidebar-content");
    const scrollPosition = sessionStorage.getItem("sidebarScrollPosition");
    if (sidebarContent && scrollPosition) {
      sidebarContent.scrollTop = parseInt(scrollPosition);
    }
  }, [location.pathname]);

  if (!items || items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarMenu onMouseLeave={() => setHoveredItem(null)}>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isParentActive = hasSubItems
            ? item.items.some(
                (subItem) =>
                  location.pathname === subItem.url ||
                  location.pathname.startsWith(subItem.url + "/")
              )
            : location.pathname === item.url ||
              location.pathname.startsWith(item.url + "/");

          const isOpen = openItem === item.title || isParentActive;

          if (!hasSubItems) {
            return (
              <SidebarMenuItem
                key={item.title}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.title)}
              >
                {hoveredItem === item.title && (
                  <motion.div
                    layoutId="sidebar-hover-highlight"
                    className="sidebar-hover-pill absolute inset-0 rounded-md pointer-events-none z-0"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <Link
                  to={item.url}
                  onClick={(e) => handleLinkClick(e, false)}
                  className="relative z-10 block"
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`rounded-md transition-colors duration-200 ${
                      isParentActive
                        ? "sidebar-active-item text-white"
                        : "text-[#A9B4C4] hover:text-white"
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span className="ml-2">{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={(open) => setOpenItem(open ? item.title : null)}
              className="group/collapsible"
            >
              <SidebarMenuItem
                className="relative"
                onMouseEnter={() => setHoveredItem(item.title)}
              >
                {hoveredItem === item.title && (
                  <motion.div
                    layoutId="sidebar-hover-highlight"
                    className="sidebar-hover-pill absolute top-0 left-0 right-0 h-[40px] rounded-md pointer-events-none z-0"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <CollapsibleTrigger asChild>
                  <div className="relative z-10">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`rounded-md transition-colors duration-200 ${
                        isOpen
                          ? "sidebar-active-item text-white"
                          : "text-[#A9B4C4] hover:text-white"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="ml-2">{item.title}</span>
                      <ChevronRight
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent
                  as={motion.div}
                  variants={itemVariants}
                  initial="closed"
                  animate={isOpen ? "open" : "closed"}
                  className="relative z-10"
                >
                  <SidebarMenuSub className="border-l border-[rgba(255,255,255,0.1)] ml-4 pl-2 mt-1 gap-1">
                    <SubMenuItemsReport
                      items={item.items}
                      handleLinkClick={handleLinkClick}
                      location={location}
                    />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

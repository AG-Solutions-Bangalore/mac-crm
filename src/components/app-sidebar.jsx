import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import makcLogo from "../assets/fevicon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  Blocks,
  Building2,
  Command,
  Bell,
  Users,
  LayoutDashboard,
  LayoutGrid,
  Settings2,
  FileText,
  AlertCircle,
  Layers,
  Home,
  Map,
  Tag,
  ListFilter,
  Package,
  BookOpen,
  Image,
  FolderKanban,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { NavMainReport } from "./nav-main-report";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: false,
    },
    SERVICELIST: {
      title: "Service",
      url: "/service-list",
      icon: LayoutGrid,
      isActive: false,
    },

    MEMBERLIST: {
      title: "Clients",
      url: "/client-list",
      icon: Users,
      isActive: false,
    },
    BUYER: {
      title: "Buyers",
      url: "/buyer-list",
      icon: Users,
      isActive: false,
    },
    PROPERTY: {
      title: "Properties",
      url: "/property-list",
      icon: Home,
      isActive: false,
    },
    FLOOR: {
      title: "Floors",
      url: "/floor-list",
      icon: Layers,
      isActive: false,
    },
    AREA: {
      title: "Areas",
      url: "/area-list",
      icon: Map,
      isActive: false,
    },
    BRAND: {
      title: "Brands",
      url: "/brand-list",
      icon: Tag,
      isActive: false,
    },
    CATEGORY: {
      title: "Categories",
      url: "/category-list",
      icon: ListFilter,
      isActive: false,
    },
    PRODUCT: {
      title: "Products",
      url: "/product-list",
      icon: Package,
      isActive: false,
    },
    QUOTATION: {
      title: "Quotations",
      url: "/quotation-list",
      icon: FileText,
      isActive: false,
    },
    PROJECT: {
      title: "Projects",
      url: "/project-list",
      icon: FolderKanban,
      isActive: false,
    },
    SERVICEREQUEST: {
      title: "Service Request",
      url: "/service-request",
      icon: Building2,
      isActive: false,
    },
    COMPLAINT: {
      title: "Complaint",
      url: "/complaint-list",
      icon: AlertCircle,
      isActive: false,
    },
    NOTIFICATION: {
      title: "Notification",
      url: "/notification-list",
      icon: Bell,
      isActive: false,
    },
    BLOG: {
      title: "Blogs",
      url: "/blog-list",
      icon: BookOpen,
      isActive: false,
    },
    GALLERY: {
      title: "Gallery",
      url: "/gallery-list",
      icon: Image,
      isActive: false,
    },
  },

  REPORTS: {
    REPORT_MENU: {
      title: "Reports",
      url: "#",
      icon: FileText,
      isActive: false,
      items: [
        {
          title: "Client Report",
          url: "/client-report",
        },
        {
          title: "Service Request",
          url: "/service-request-report",
        },
      ],
    },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Blocks,
      isActive: false,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "BUYER",
      "PROPERTY",
      "FLOOR",
      "AREA",
      "BRAND",
      "CATEGORY",
      "PRODUCT",
      "QUOTATION",
      "PROJECT",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
      // "SETTINGS",
    ],
    navMainReport: ["REPORT_MENU"],
  },

  2: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "BUYER",
      "PROPERTY",
      "FLOOR",
      "AREA",
      "BRAND",
      "CATEGORY",
      "PRODUCT",
      "QUOTATION",
      "PROJECT",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
    ],
    navMainReport: ["REPORT_MENU"],
  },

  3: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "BUYER",
      "PROPERTY",
      "FLOOR",
      "AREA",
      "BRAND",
      "CATEGORY",
      "PRODUCT",
      "QUOTATION",
      "PROJECT",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
      "BLOG",
      "GALLERY",
    ],
    navMainReport: ["REPORT_MENU"],
  },

  4: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "BUYER",
      "PROPERTY",
      "FLOOR",
      "AREA",
      "BRAND",
      "CATEGORY",
      "PRODUCT",
      "QUOTATION",
      "PROJECT",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
    ],
    navMainReport: ["REPORT_MENU"],
  },
};

const LIMITED_MASTER_SETTINGS = {
  title: "Master Settings",
  url: "#",
  isActive: false,
  icon: Settings2,
  items: [
    {
      title: "Chapters",
      url: "/master/chapter",
    },
  ],
};

const useNavigationData = (userType) => {
  return useMemo(() => {
    const permissions =
      USER_ROLE_PERMISSIONS[userType] || USER_ROLE_PERMISSIONS[1];

    const buildNavItems = (permissionKeys, config, customItems = {}) => {
      return permissionKeys
        .map((key) => {
          if (key === "MASTER_SETTINGS_LIMITED") {
            return LIMITED_MASTER_SETTINGS;
          }
          return config[key];
        })
        .filter(Boolean);
    };

    const navMain = buildNavItems(
      permissions.navMain,
      // { ...NAVIGATION_CONFIG.COMMON, ...NAVIGATION_CONFIG.MODULES },
      { ...NAVIGATION_CONFIG.COMMON },
      // { MASTER_SETTINGS_LIMITED: LIMITED_MASTER_SETTINGS }
    );

    const navMainReport = buildNavItems(
      permissions.navMainReport,
      NAVIGATION_CONFIG.REPORTS,
    );

    return { navMain, navMainReport };
  }, [userType]);
};

const TEAMS_CONFIG = [
  {
    name: "MAKc",
    logo: makcLogo,
    plan: "",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
];

export function AppSidebar({ ...props }) {
  const [openItem, setOpenItem] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const { navMain, navMainReport } = useNavigationData(user?.user_type);

  const initialData = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: TEAMS_CONFIG,
    navMain,
    navMainReport,
  };

  const dashboardItem = initialData.navMain.filter((item) => item.url === "/dashboard");
  const masterItems = initialData.navMain.filter((item) => ["Service", "Clients", "Buyers", "Properties", "Floors", "Areas", "Brands", "Categories", "Products", "Blogs", "Gallery"].includes(item.title));
  const operationsItems = initialData.navMain.filter((item) => ["Quotations", "Projects", "Service Request", "Notification"].includes(item.title));
  const reportItems = initialData.navMainReport.filter((item) => item.title === "Reports");
  const systemItems = initialData.navMainReport.filter((item) => item.title === "Settings" || item.url === "/settings");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/40">
        <div className="brand flex items-center gap-2.5 px-2 py-2.5 overflow-hidden">
          <img src={makcLogo} alt="MAKc" className="w-[28px] h-[28px] object-contain rounded shrink-0" />
          <div className="brand-name font-bold truncate transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
            MAKc
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="sidebar-content px-2">
        {dashboardItem.length > 0 && (
          <div className="sidebar-group-dashboard">
            <NavMain
              items={dashboardItem}
              openItem={openItem}
              setOpenItem={setOpenItem}
              groupId="dashboard"
            />
          </div>
        )}
        
        {masterItems.length > 0 && (
          <div className="sidebar-group-masters">
            <div className="nav-sec group-data-[collapsible=icon]:hidden">Masters</div>
            <NavMain
              items={masterItems}
              openItem={openItem}
              setOpenItem={setOpenItem}
              groupId="masters"
            />
          </div>
        )}

        {operationsItems.length > 0 && (
          <div className="sidebar-group-operations">
            <div className="nav-sec group-data-[collapsible=icon]:hidden">Operations</div>
            <NavMain
              items={operationsItems}
              openItem={openItem}
              setOpenItem={setOpenItem}
              groupId="operations"
            />
          </div>
        )}

        {reportItems.length > 0 && (
          <div className="sidebar-group-insights">
            <div className="nav-sec group-data-[collapsible=icon]:hidden">Insights</div>
            <NavMainReport
              items={reportItems}
              openItem={openItem}
              setOpenItem={setOpenItem}
              groupId="insights"
            />
          </div>
        )}

        {systemItems.length > 0 && (
          <div className="sidebar-group-system">
            <div className="nav-sec group-data-[collapsible=icon]:hidden">System</div>
            <NavMain
              items={systemItems}
              openItem={openItem}
              setOpenItem={setOpenItem}
              groupId="system"
            />
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { NAVIGATION_CONFIG, USER_ROLE_PERMISSIONS };

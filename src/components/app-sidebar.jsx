import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  Blocks,
  Building2,
  Command,
  GalleryVerticalEnd,
  Globe,
  Image,
  LayoutGrid,
  Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutGrid,
      isActive: false,
    },
    SERVICELIST: {
      title: "Service",
      url: "/service-list",
      icon: LayoutGrid,
      isActive: false,
    },

    MEMBERLIST: {
      title: "Member",
      url: "/member-list",
      icon: Image,
      isActive: false,
    },
    SERVICEREQUEST: {
      title: "Service Request",
      url: "/service-request",
      icon: Building2,
      isActive: false,
    },
    NOTIFICATION: {
      title: "Notification",
      url: "/notification-list",
      icon: Globe,
      isActive: false,
    },

    // STUDENTLIST: {
    //   title: "Student",
    //   url: "#",
    //   icon: Settings,
    //   items: [
    //     {
    //       title: "Testimonial",
    //       url: "/student-testimonial",
    //       icon: Users,
    //     },
    //     {
    //       title: "Youtube",
    //       url: "/student-youtube",
    //       icon: Users,
    //     },
    //     {
    //       title: "Certificate",
    //       url: "/student-certificate",
    //       icon: Users,
    //     },
    //     {
    //       title: "Success Story",
    //       url: "/student-story",
    //       icon: Users,
    //     },
    //     {
    //       title: "Recent Passout",
    //       url: "/student-recent-passout",
    //       icon: Users,
    //     },
    //     {
    //       title: "Office Image",
    //       url: "/student-officeimage",
    //       icon: Users,
    //     },
    //     {
    //       title: "Map",
    //       url: "/student-map",
    //       icon: Users,
    //     },
    //     {
    //       title: "Top",
    //       url: "/student-top",
    //       icon: Users,
    //     },
    //     {
    //       title: "ScreenShot",
    //       url: "/student-screenshot",
    //       icon: Users,
    //     },
    //   ],
    // },
  },

  REPORTS: {
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
      "SERVICEREQUEST",
      "NOTIFICATION",
      // "SETTINGS",
    ],
    navMainReport: ["SUMMARY", "DOWNLOADS", "OTHER", "SETTINGS"],
  },

  2: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "NOTIFICATION",
    ],
    navMainReport: ["SUMMARY", "DOWNLOADS", "OTHER", "SETTINGS"],
  },

  3: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "NOTIFICATION",
    ],
    navMainReport: ["SUMMARY", "DOWNLOADS", "OTHER", "SETTINGS"],
  },

  4: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "NOTIFICATION",
    ],
    navMainReport: ["SUMMARY", "DOWNLOADS", "OTHER", "SETTINGS"],
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

    // const navMainReport = buildNavItems(
    //   permissions.navMainReport,
    //   NAVIGATION_CONFIG.REPORTS
    // );

    return { navMain };
  }, [userType]);
};

const TEAMS_CONFIG = [
  {
    name: "AIA",
    logo: GalleryVerticalEnd,
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        <NavMain
          items={initialData.navMain}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
        {/* <NavMainReport
          items={initialData.navMainReport}
          openItem={openItem}
          setOpenItem={setOpenItem}
        /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { NAVIGATION_CONFIG, USER_ROLE_PERMISSIONS };

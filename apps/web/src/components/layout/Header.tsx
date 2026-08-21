import React from "react";
import { DashboardNavbar } from "../../features/dashboard/components/DashboardNavbar";

export interface HeaderProps {
  onOpenSettings?: (
    tab?: "profile" | "avatar" | "security" | "gamification",
  ) => void;
  onOpenFlameNurture?: () => void;
  onOpenXpHistory?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return <DashboardNavbar {...props} />;
};

export default Header;

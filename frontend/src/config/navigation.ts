import type { ComponentProps } from "react";
import type Icon from "../components/Icon";

export type NavIconName = ComponentProps<typeof Icon>["name"];

export type NavItem = {
  to: string;
  label: string;
  shortLabel: string;
  icon: NavIconName;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: "home" },
  { to: "/upload", label: "Upload", shortLabel: "Upload", icon: "upload" },
  { to: "/quiz", label: "Quizzes", shortLabel: "Quiz", icon: "quiz" },
  { to: "/flashcards", label: "Flashcards", shortLabel: "Cards", icon: "flashcards" },
  { to: "/chat", label: "Chat", shortLabel: "Chat", icon: "chat" },
  { to: "/demo", label: "Demo", shortLabel: "Demo", icon: "demo" },
];

export function breadcrumbForPath(pathname: string): { label: string; to: string | null }[] {
  if (pathname === "/dashboard") {
    return [{ label: "Dashboard", to: null }];
  }
  const item = NAV_ITEMS.find((n) => n.to === pathname);
  if (!item) {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Page", to: null }];
  }
  return [{ label: "Dashboard", to: "/dashboard" }, { label: item.label, to: null }];
}

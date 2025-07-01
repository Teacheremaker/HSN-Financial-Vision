
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, LayoutDashboard, Sheet, Users, DollarSign, Wrench } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const links = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/entities", label: "Entités", icon: Users },
  { href: "/revenues", label: "Recettes", icon: DollarSign },
  { href: "/tariffs", label: "Tarifs", icon: Sheet },
  { href: "/costs", label: "Coûts opérationnels", icon: Coins },
  { href: "/services", label: "Services", icon: Wrench },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

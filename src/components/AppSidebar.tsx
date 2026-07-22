import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Briefcase, Users, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { HireflyLogo } from "./HireflyLogo";
import { useCompany } from "@/lib/company-store";
import { demoUser } from "@/mocks/company";
import { signOut } from "@/lib/session";
import { toast } from "sonner";

const items = [
  { title: "Inicio", url: "/app", icon: Home, exact: true },
  { title: "Vacantes", url: "/app/vacantes", icon: Briefcase },
  { title: "Candidatos", url: "/app/vacantes", icon: Users },
  { title: "Configuración", url: "/app/configuracion/empresa", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const company = useCompany();
  const navigate = useNavigate();

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <HireflyLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Empresa</p>
          <p className="text-sm font-medium text-foreground">{company.name}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              SM
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{demoUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{demoUser.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              toast.success("Sesión cerrada");
              navigate({ to: "/" });
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
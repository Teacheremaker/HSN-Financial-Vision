
import { SidebarTrigger } from "@/components/ui/sidebar";

type HeaderProps = {
  title: string;
  actions?: React.ReactNode;
};

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between space-y-2 p-4 pt-6 md:p-8 md:pt-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </header>
  );
}

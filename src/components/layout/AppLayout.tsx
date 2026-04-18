import { ReactNode, useState } from 'react';
import { AppSidebar } from './Sidebar';
import { AppHeader } from './Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 max-w-[80vw]">
          <AppSidebar mobile onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col md:ml-60 min-w-0 w-full">
        <AppHeader onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 md:p-6 overflow-x-hidden w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}

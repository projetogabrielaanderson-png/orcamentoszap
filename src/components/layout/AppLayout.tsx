import { ReactNode } from 'react';
import { AppSidebar } from './Sidebar';
import { AppHeader } from './Header';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-16 flex flex-1 flex-col md:ml-60">
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

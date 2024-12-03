import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Protected({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <SidebarProvider>
        <AppSidebar/>
        {children}
      </SidebarProvider>
    );
};
import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';

export default function Protected({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className='inline-flex w-screen h-screen'>
            <AppSidebar/>
            {children}
        </div>
    );
};
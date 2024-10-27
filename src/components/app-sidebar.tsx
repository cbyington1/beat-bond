import * as React from "react"

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ClerkUser } from "./clerk-user"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Playlists",
      url: "/playlists",
    },
    {
      title: "Generate",
      url: "/recommendations",
    },
    {
      title: "Stats",
      url: "/statistics",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" className="flex h-fit" {...props}>
      <div className="rounded-lg">
      <SidebarHeader className="pt-4 pl-4">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <div className="inline-flex space-x-2">
            <UserButton />
            <ClerkUser />
          </div>
        </SignedIn>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      </div>
    </Sidebar>
  )
}

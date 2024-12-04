'use client';
import * as React from "react"

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ClerkUser } from "./clerk-user"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/protected/homepage",
    },
    {
      title: "Playlists",
      url: "/protected/playlists",
    },
    {
      title: "Recommendations",
      url: "/protected/recommendations",
    },
    {
      title: "Stats",
      url: "/protected/stats",
    },
    {
      title: "Search",
      url: "/protected/search",
    },
    {
      title: "Profile",
      url: "/protected/profile",
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const friends = useQuery(api.users.getFriends) || [];


  return (
    <Sidebar variant="floating" className="flex" {...props}>
      <div className="rounded-lg bg-gray-">
      <SidebarHeader className="pt-4 pl-4">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <div className="inline-flex space-x-2">
            <UserButton 
              userProfileProps={{
                additionalOAuthScopes: {
                  spotify: ['user-top-read', 'user-read-recently-played', 'playlist-modify-public']
                },
              }}          
            />
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
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {`Friends (${friends.length})`}
            {friends.map((friend) => (
              <SidebarMenuItem key={friend?.name}>
                <SidebarMenuButton asChild>
                  <a href={`/protected/${friend?.userID}`} className="font-medium">
                    {friend?.username}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      </div>
    </Sidebar>
  )
}

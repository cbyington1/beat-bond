'use client'
import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export default function Home() {

  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn) {
      return (
        <div className="h-full w-full py-2 pr-2">
        <Card className="h-full w-full bg-bbbackground text-[#FFFFFF] text-2xl">
          <div className="p-4">
            <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150} className="rounded-xl"></Image>
            <p>Hello, Please sign in</p>
          </div>
        </Card>
      </div>
      )
  }

  const username = user.firstName

  return (
    <div className="h-full w-full py-2 pr-2">
      <Card className="h-full w-full bg-bbbackground text-[#FFFFFF] text-2xl">
        <div className="p-4">
          <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150} className="rounded-xl"></Image>
          <p>Hello {username}!</p>
        </div>
      </Card>
    </div>
  );
}

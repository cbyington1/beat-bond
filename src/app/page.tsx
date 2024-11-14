'use client'

import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import MainPage from "@/components/mainpage";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()
  if (!isLoaded) {
    return (
      <div className="h-full w-full py-2 pr-2">
        <Card className="h-full w-full bg-bbbackground text-[#FFFFFF] text-2xl">
          <div className="p-4">
            <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150} className="rounded-xl"></Image>
            <Skeleton className="h-7 w-7 rounded-full"></Skeleton>
            <Skeleton className='h-4 w-[150px] self-center'></Skeleton>
          </div>
        </Card>
      </div>
    )
  } else if (!isSignedIn) {
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
      <Card className="h-fit w-full border-none bg-gray-900 text-[#FFFFFF] text-2xl">
        <div className="p-4">
          <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150} className="rounded-xl"></Image>
          <p>Hello {username}!</p>
          <MainPage />
        </div>
      </Card>
    </div>
  );
}

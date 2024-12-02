'use client'
import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import MainPage from "@/components/mainpage";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="p-8 flex flex-col items-center space-y-6">
            <div className="relative">
              <Image 
                src='/bblogo.jpeg' 
                alt="bblogo" 
                width={180} 
                height={180} 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-2xl" />
            </div>
            <div className="space-y-4 w-full max-w-sm">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-full mx-auto" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
        <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="p-8 flex flex-col items-center space-y-8">
            <div className="relative">
              <Image 
                src='/bblogo.jpeg' 
                alt="bblogo" 
                width={180} 
                height={180} 
                className="rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-2xl" />
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Welcome to BB
              </h1>
              <p className="text-gray-400 text-lg">
                Please sign in to continue
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <Card className="mx-auto max-w-4xl rounded-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative shrink-0">
              <Image 
                src='/bblogo.jpeg' 
                alt="bblogo" 
                width={180} 
                height={180} 
                className="rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-2xl" />
            </div>
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-400">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-400">
                  Ready to find music?
                </p>
              </div>
              <MainPage />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
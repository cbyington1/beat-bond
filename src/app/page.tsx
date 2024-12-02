'use client'
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const updateUser = useMutation(api.users.updateUser);

  if (!isSignedIn) {
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white space-y-2">
      <Image src="/bblogo.jpeg" alt="BeatBond Logo" width={500} height={500} className="rounded-3xl" />
      <SignedOut>
        <div className="px-4 py-2 bg-blue-500 text-white rounded-md transition-transform transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
          <SignInButton />
        </div>
      </SignedOut>
    </div>
    );
  } else {
    updateUser()
    router.push("/protected/homepage");
  }
}

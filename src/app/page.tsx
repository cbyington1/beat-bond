import Image from "next/image";
import React from "react";
import { ClerkUser } from "@/components/clerk-user";

export default function Home() {

  return (
    <div className="bg-bbbackground flex flex-col">
      <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150}></Image>
      <p className="pl-6 text-[#FFFFFF] text-2xl">
        Hello 
        <ClerkUser />
      </p>
    </div>
  );
}

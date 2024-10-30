'use client'
import Image from "next/image";
import React from "react";
import { Card } from "@/components/ui/card";

export default function recommendations() {

    return (
      <div className="h-full w-full py-2 pr-2">
      <Card className="h-full w-full bg-bbbackground text-[#FFFFFF] text-2xl">
        <div className="p-4">
          <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150} className="rounded-xl"></Image>
          <p>Recommendations</p>
        </div>
      </Card>
    </div>
    );
  }
  
'use client'

import Image from "next/image";
import { Card } from "@/components/ui/card";
import GenRecommendations from "@/components/genRecomendations";

export default function Recommendations() {
  return (
      <div className="h-full w-full py-2 pr-2">
        <Card className="h-full w-full bg-bbbackground text-[#FFFFFF] text-2xl">
          <div className="p-4">
            <Image
              src="/bblogo.jpeg"
              alt="bblogo"
              width={150}
              height={150}
              className="rounded-xl"
            ></Image>
            <GenRecommendations />
          </div>
        </Card>
      </div>
  );
}

'use client'
import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const URL = "http://localhost:3450/api";
  
async function login() {
  const res = await axios.get(`${URL}/login`, {
    withCredentials: true,
  });
  console.log(res)
}

export default function Recommendations() {

  
  return (
    <div className="h-full w-full py-2 pr-2">
    <Card className="h-full w-full bg-bbbackground text-[#FFFFFF] text-2xl">
      <div className="p-4">
        <Image src='/bblogo.jpeg' alt="bblogo" width={150} height={150} className="rounded-xl"></Image>
        <Button onClick={login}>Login with Spotify</Button>
      </div>
    </Card>
  </div>
  );
}
  
'use client'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

const Login = () => {
    const login = () => {
        signIn('google', { callbackUrl: '/' })
    }
  return (
      <Card className="min-w-[30%]">
        <div className="flex justify-center items-center">
            <Image src='/icon.png' width={50} height={50} alt='CoSketch Logo'/>
            <h1 className="text-3xl font-bold text-orange-500">CoSketch</h1>
        </div>
        <CardHeader className="flex justify-center flex-col items-center ">
          <CardTitle>Sign In With Google</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Button variant='outline' size='sm' className="border-2 rounded-xl p-4 h-10 w-full" onClick={login}><FaGoogle size={25}/></Button>
          <CardDescription className=" hover:underline text-foreground"><Link href='/'>Sign In Later</Link></CardDescription>
        </CardContent>
      </Card>
  );
};
export default Login;

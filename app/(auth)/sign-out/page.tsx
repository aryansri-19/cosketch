'use client'
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const LogOut = () => {
    const handleLogout = async () => {
        await signOut({
            redirect: true,
            callbackUrl: '/'
        });
    }
    return ( 
        <div>
            <Button variant='custom' size='sm' onClick={handleLogout}>Sign Out</Button>
        </div>
     );
}
 
export default LogOut;
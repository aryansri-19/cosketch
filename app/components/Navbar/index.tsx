import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import UserProfile from "./UserProfile";

const Navbar = async () => {
    const user = await auth();
    return ( 
        <>
            <nav className="bg-background dark:bg-foregorund flex justify-between items-center m-auto pr-5 pl-8 max-h-12 sticky">
                <Image src='/icon.png' width={50} height={50} alt='CoSketch Logo'/>
                <Link href='/'><h1 className="text-3xl font-bold text-orange-500 pl-20">CoSketch</h1></Link>
                <section className="flex justify-between space-x-5">
                    <Link href='/invite'><Button variant='custom' size='sm'>Invite</Button></Link>
                    { (user?.user && user.user?.image) ? 
                    <UserProfile userData={user?.user}/>
                    : <Link href='/sign-in'><Button variant='custom' size='sm'>Sign In</Button></Link>}
                </section>
            </nav>
        </>
    );
}
 
export default Navbar;
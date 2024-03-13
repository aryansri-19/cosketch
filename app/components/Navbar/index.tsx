import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
    return ( 
        <>
            <nav className=" bg-background dark:bg-foregorund flex justify-between items-center m-auto pr-5 pl-8 max-h-12 sticky">
                <Image src='/icon.png' width={50} height={50} alt='CoSketch Logo'/>
                <Link href='/'><h1 className="text-3xl font-bold text-orange-500 pl-20">CoSketch</h1></Link>
                <section className="flex justify-between space-x-4      ">
                    <Link href='/invite'><Button variant='custom' size='sm' className="border-2 rounded-xl p-4 h-10">Invite</Button></Link>
                    <Link href='/sign-in'><Button variant='custom' size='sm' className="border-2 rounded-xl p-4 h-10">Sign In</Button></Link>
                </section>
            </nav>
        </>
    );
}
 
export default Navbar;
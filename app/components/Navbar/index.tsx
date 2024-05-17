import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Navbar = async () => {
    return ( 
        <>
            <nav className="bg-background dark:bg-foregorund flex justify-between items-center m-auto pr-5 pl-8 max-h-12 sticky">
                <Link href='/'><Image src='/icon.png' width={50} height={50} alt='CoSketch Logo'/></Link>
                <h1 className="text-3xl font-bold text-orange-500 pl-20">CoSketch</h1>
                <Link href='/invite'><Button variant='custom' size='default' className="text-foreground">Invite</Button></Link>
            </nav>
        </>
    );
}
 
export default Navbar;
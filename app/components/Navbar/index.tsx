import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Navbar = async () => {
    return ( 
        <>
            <nav className="bg-background dark:bg-foregorund flex justify-between items-center m-auto max-h-12 sticky top-0 left-0 right-0">
                <div className="order-[-1] pl-8">
                <Link href='/'><Image src='/icon.png' width={50} height={50} alt='CoSketch Logo'/></Link>
                </div>
                <h1 className="text-3xl font-bold text-orange-500">CoSketch</h1>
                <Link href='/invite' className="pr-5"><Button variant='custom' size='default' className="text-foreground">Invite</Button></Link>
            </nav>
        </>
    );
}
 
export default Navbar;
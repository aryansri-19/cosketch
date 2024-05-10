import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "next-auth";
import Link from "next/link";

const UserProfile = ({ userData }: { userData: User | undefined}) => {
    return ( 
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                className=" mt-[0.1rem] h-[2rem] w-[2rem] rounded-full"
                >
            <Avatar>
                <AvatarImage src='https://lh3.googleusercontent.com/a/ACg8ocKmg6lqLsF1GzUt5PyU39y6iKQZ_LR00F2Xq8ZcWPYrmd4huUBP=s96-c' alt='ahel'/>
                <AvatarFallback>Cosketch</AvatarFallback>
            </Avatar>
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>{userData?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href='/sign-out'>Sign Out</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
     );
}
 
export default UserProfile;
import React from "react";
import Navbar from "../components/Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return ( 
    <div className="relative h-screen">
      <Navbar/>
      { children }
    </div>
   );
}
 
export default Layout;
import React from "react";
import Navbar from "../components/Navbar";
import ToolBar from "../components/ToolBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return ( 
    <div className="relative h-screen">
      <Navbar/>
      { children }
      <ToolBar/>
    </div>
   );
}
 
export default Layout;
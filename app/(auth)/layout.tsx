import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-background dark:bg-foreground flex justify-center items-center min-h-screen'>
        {children}
    </div>
  )
}

export default Layout;

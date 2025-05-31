"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using framer-motion
import Link from 'next/link';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Menu, X, FileText, Briefcase, UserCircle, LogIn } from 'lucide-react'; // Icons
import { usePathname } from 'next/navigation'; // To highlight active link
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const NavLink = ({ href, children, onClick, className = "" }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
            href={href} 
            onClick={onClick}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out hover:bg-slate-700/50 hover:text-slate-100
                        ${isActive ? 'bg-slate-700 text-slate-50 shadow-inner' : 'text-slate-300'} ${className}`}
        >
            {children}
        </Link>
    );
};

const MobileNavLink = ({ href, children, icon: Icon, onClick, gradient }: { href: string; children: React.ReactNode; icon: React.ElementType; onClick?: () => void; gradient: string; }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn('flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150', isActive ? 'bg-primary/10 text-primary' : `bg-clip-text text-transparent bg-gradient-to-r ${gradient} hover:bg-slate-700 hover:text-slate-50`)}
        >
            <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
            {children}
        </Link>
    );
};
// {` flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-150
                        // ${isActive ? 'bg-primary/20 text-primary' : {gradient} + ' bg-clip-text text-transparent bg-gradient-to-r hover:bg-slate-700 hover:text-slate-50'}`}

const Nav = () => {
    const { isSignedIn, user } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { href: "/interviews", label: "Interviews", icon: Briefcase, gradient: "from-orange-500 via-amber-500 to-yellow-500" },
        { href: "/my-resume", label: "My Resume", icon: FileText, gradient: "from-purple-400 via-pink-500 to-red-500" },
        // Add more items here if needed, e.g.:
        // { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, gradient: "from-sky-400 via-cyan-400 to-teal-400" },
    ];

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } },
    };

    return (
        <motion.nav
            initial={{ y: -70, opacity: 0 }} // Start further up
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "circOut", delay: 0.1 }} // circOut for a bit of bounce, slight delay
            className="backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50 shadow-lg" // Darker, more blur, subtle border
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="text-2xl md:text-3xl font-extrabold tracking-tighter hover:opacity-80 transition-opacity duration-200 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-500">
                        AInterview
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <NavLink key={item.href} href={item.href}>
                                <span className={`font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${item.gradient}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                        {isSignedIn ? (
                            <div className="ml-2"> {/* Add some margin for UserButton */}
                                <UserButton appearance={{
                                    elements: {
                                        avatarBox: "h-9 w-9 ring-2 ring-slate-600 hover:ring-primary transition-all",
                                    }
                                }}/>
                            </div>
                        ) : (
                            <SignInButton mode="modal">
                                <Button variant="ghost" className="text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 px-3 py-2">
                                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                                </Button>
                            </SignInButton>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        {isSignedIn && <div className="mr-2"><UserButton afterSignOutUrl="/" appearance={{elements: {avatarBox: "h-8 w-8"}}}/></div>}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-all"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="md:hidden bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 absolute w-full shadow-xl"
                        // style={{ originY: 0 }} // For a top-down scale animation if preferred
                    >
                        <div className="px-3 pt-3 pb-4 space-y-1.5">
                            {navItems.map((item) => (
                                <MobileNavLink 
                                    key={item.href} 
                                    href={item.href} 
                                    icon={item.icon}
                                    onClick={() => setMobileMenuOpen(false)}
                                    gradient={item.gradient}
                                >
                                    {item.label}
                                </MobileNavLink>
                            ))}
                            <hr className="border-slate-700 my-2"/>
                            {!isSignedIn && (
                                <SignInButton mode="modal">
                                    <button className="w-full flex items-center px-4 py-3 text-base font-medium rounded-lg text-slate-200 hover:bg-slate-700 hover:text-slate-50 transition-colors duration-150">
                                        <LogIn className="mr-3 h-5 w-5 text-slate-400" />
                                        Sign In
                                    </button>
                                </SignInButton>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

export default Nav;
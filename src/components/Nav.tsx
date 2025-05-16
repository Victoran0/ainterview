"use client"
import React from 'react'
import {motion} from 'motion/react'
import Link from 'next/link'

const Nav = () => {
    return (
        <div>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
                        AInterview
                    </Link>
                    <div className="space-x-4">
                        <Link href="/get-started" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        New Interview
                        </Link>
                        {/* Add other links: Dashboard, Profile, etc. */}
                    </div>
                </div>
            </motion.nav>
        </div>
    )
}

export default Nav

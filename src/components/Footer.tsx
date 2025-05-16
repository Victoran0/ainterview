import React from 'react'

const Footer = () => {
    return (
        <div>
            <footer className="py-8 border-t border-border bg-muted/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
                    © {new Date().getFullYear()} AInterview. All rights reserved.
                    {/* Add more footer links or info */}
                </div>
            </footer>
        </div>
    )
}

export default Footer

"use client";
import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const publicLinks = [
    {
    href: "/",
    label: "Home",
    icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
},
{
    href: "/about",
    label: "About",
    icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
},
{
    href: "/cases",
    label: "Cases",
    icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
},
{
    href: "/contact",
    label: "Contact",
    icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
},
];

export default function PublicLayout({
    children,
}: {
    children: ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
    <div className="min-h-screen flex flex-col bg-white">
        {/* ── HEADER ── */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-slate-900">TounesHelp</span>
                </Link>
                </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
                {publicLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                    }`}
                    >
                    {link.icon}
                    {link.label}
                    </Link>
                );
                })}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
                <Link
                href="/login"
                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Sign In</Link>
                <Link
                href="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Get Started</Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
                <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                )}
                </svg>
                </button>
            </div>
            </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-3 space-y-2">
                {publicLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                    }`}>
                    {link.icon}
                    {link.label}
                </Link>
                );
            })}
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-slate-600 hover:text-indigo-600 font-medium py-2">Sign In</Link>
                <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Get Started</Link>
            </div>
            </div>
        </div>
        )}
    </header>

      {/* ── MAIN CONTENT ── */}
    <main className="flex-1">
        {children}
    </main>

      {/* ── FOOTER ── */}
    <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold">TounesHelp</span>
                </div>
                <p className="text-slate-400 max-w-md">
                Bridging the gap between marginalized communities in Tunisia's underserved regions and the organizations, volunteers, and donors who can help them.
                </p>
            </div>

            {/* Quick Links */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
                <ul className="space-y-2">
                <li>
                    <Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link>
                </li>
                <li>
                    <Link href="/cases" className="text-slate-400 hover:text-white transition-colors">Browse Cases</Link>
                </li>
                <li><Link href="/organizations" className="text-slate-400 hover:text-white transition-colors">Organizations</Link>
                </li>
                <li>
                    <Link href="/volunteer" className="text-slate-400 hover:text-white transition-colors">Volunteer</Link>
                </li>
                </ul>
            </div>

            {/* Contact */}
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h3>
                <ul className="space-y-2 text-slate-400">
                    <li>Email: info@touneshelp.com</li>
                    <li>Phone: +216 XX XXX XXX</li>
                    <li>Location: Tunisia</li>
                </ul>
            </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} TounesHelp. All rights reserved.</p>
            </div>
            </div>
            </footer>
            </div>
            );
}

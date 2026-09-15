"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-black text-white shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">

            {/* LOGO */}
            <Link
              href="/"
              onClick={closeMenu}
              className="text-lg sm:text-2xl font-bold tracking-wide whitespace-nowrap"
            >
              ✨ Salon Management
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition"
              >
                Home
              </Link>

              <Link
                href="/#services"
                className="text-gray-300 hover:text-white transition"
              >
                Services
              </Link>

              <Link
                href="/#features"
                className="text-gray-300 hover:text-white transition"
              >
                Features
              </Link>

              <Link
                href="/#about"
                className="text-gray-300 hover:text-white transition"
              >
                About
              </Link>
            </nav>

            {/* DESKTOP AUTH BUTTONS */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-600 text-sm sm:text-base hover:bg-gray-800 transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="px-3 sm:px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm sm:text-base hover:bg-gray-200 transition"
              >
                Sign Up
              </Link>
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-lg hover:bg-gray-800 transition"
              aria-label="Open menu"
            >
              <span
                className={`block w-6 h-0.5 bg-white transition ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />

              <span
                className={`block w-6 h-0.5 bg-white transition ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`block w-6 h-0.5 bg-white transition ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 top-16 sm:top-20 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* MOBILE SIDE MENU - 60% WIDTH */}
      <aside
        className={`fixed top-16 sm:top-20 left-0 z-50 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-[60vw] max-w-[60vw] bg-black text-white shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* MENU LINKS */}
          <nav className="flex flex-col px-5 py-6 gap-2">

            <Link
              href="/"
              onClick={closeMenu}
              className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              🏠 Home
            </Link>

            <Link
              href="/#services"
              onClick={closeMenu}
              className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              ✂️ Services
            </Link>

            <Link
              href="/#features"
              onClick={closeMenu}
              className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              ⚡ Features
            </Link>

            <Link
              href="/#about"
              onClick={closeMenu}
              className="px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              ✨ About
            </Link>

          </nav>

          {/* MOBILE AUTH */}
          <div className="mt-auto px-5 pb-7 border-t border-gray-800 pt-6">

            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full text-center px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition"
            >
              Login
            </Link>

            <Link
              href="/signup"
              onClick={closeMenu}
              className="block w-full text-center px-4 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition mt-3"
            >
              Sign Up
            </Link>

          </div>

        </div>
      </aside>
    </>
  );
}
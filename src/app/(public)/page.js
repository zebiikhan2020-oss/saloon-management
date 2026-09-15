"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-950 box-border">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section
        id="home"
        className="w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 sm:py-16 lg:py-20">

            {/* HERO LEFT */}
            <div className="w-full text-center lg:text-left min-w-0">

              <div className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs sm:text-sm text-gray-300 mb-5 max-w-full">
                ✨ Your Beauty, Our Priority
              </div>

              <h1 className="w-full text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-snug sm:leading-tight">
                Manage Your Salon
                <span className="block text-gray-400 mt-1">
                  Smarter & Easier
                </span>
              </h1>

              <p className="w-full max-w-xl mx-auto lg:mx-0 mt-4 text-xs sm:text-base lg:text-lg text-gray-300 leading-relaxed">
                Book appointments, choose services, discover professional staff and manage everything from one convenient platform.
              </p>

              {/* BUTTONS */}
              <div className="w-full mt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                <Link
                  href="/customer/book"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition text-center text-sm sm:text-base shadow-md"
                >
                  📅 Book Appointment
                </Link>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-600 hover:bg-white/10 transition font-semibold text-center text-sm sm:text-base"
                >
                  Create Account
                </Link>
              </div>

              {/* STATS */}
              <div className="w-full max-w-md mx-auto lg:mx-0 mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2">
                <div className="text-center lg:text-left">
                  <p className="text-base sm:text-2xl font-bold">24/7</p>
                  <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5">Easy Booking</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-base sm:text-2xl font-bold">Easy</p>
                  <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5">Management</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-base sm:text-2xl font-bold">Fast</p>
                  <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5">Notifications</p>
                </div>
              </div>

            </div>

            {/* HERO RIGHT (Desktop Preview Card) */}
            <div className="hidden lg:block w-full">
              <div className="w-full bg-white rounded-3xl p-6 xl:p-7 shadow-2xl text-gray-900">
                <div className="flex items-center justify-between gap-4 mb-7">
                  <div>
                    <p className="text-sm text-gray-500">Salon Appointment</p>
                    <h3 className="text-2xl font-bold mt-1">Hair Styling</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    ✂️
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-xl">📅</div>
                    <div>
                      <p className="text-xs text-gray-500">Appointment Date</p>
                      <p className="font-semibold">Select Your Date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-xl">⏰</div>
                    <div>
                      <p className="text-xs text-gray-500">Appointment Time</p>
                      <p className="font-semibold">Select Your Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-xl">👨‍💼</div>
                    <div>
                      <p className="text-xs text-gray-500">Professional</p>
                      <p className="font-semibold">Choose Your Staff</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-green-50 text-green-700 font-semibold text-center">
                  ✓ Easy & Secure Booking
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          ACCOUNT SECTION
      ===================================================== */}
      <section className="w-full py-12 sm:py-16 bg-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">

          <div className="w-full max-w-xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Account
            </p>
            <h2 className="text-xl sm:text-3xl font-bold mt-1.5 sm:mt-2">
              Manage Your Account
            </h2>
            <p className="text-gray-500 text-xs sm:text-base mt-2 leading-relaxed">
              Access your account, recover your password or update your password whenever you need.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Link href="/login" className="bg-white rounded-2xl p-5 shadow-sm border block hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">🔐</div>
              <h3 className="text-base font-bold mt-4">Login</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Sign in to your account and dashboard.</p>
            </Link>

            <Link href="/signup" className="bg-white rounded-2xl p-5 shadow-sm border block hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">👤</div>
              <h3 className="text-base font-bold mt-4">Create Account</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Create a new account to book appointments.</p>
            </Link>

            <Link href="/forgot-password" className="bg-white rounded-2xl p-5 shadow-sm border block hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">🔑</div>
              <h3 className="text-base font-bold mt-4">Forgot Password</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Recover your account securely.</p>
            </Link>

            <Link href="/change-password" className="bg-white rounded-2xl p-5 shadow-sm border block hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">🛡️</div>
              <h3 className="text-base font-bold mt-4">Change Password</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Update your password to stay secure.</p>
            </Link>
          </div>

        </div>
      </section>


      {/* =====================================================
          SERVICES SECTION
      ===================================================== */}
      <section id="services" className="w-full py-12 sm:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
          <div className="w-full max-w-xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Our Services</p>
            <h2 className="text-xl sm:text-3xl font-bold mt-1.5">Beauty Services For You</h2>
            <p className="text-gray-500 text-xs sm:text-base mt-2">Choose your desired service and book easily.</p>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-5 rounded-2xl border bg-gray-50">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-xl">✂️</div>
              <h3 className="text-lg font-bold mt-4">Hair Services</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Professional styling, cutting and treatments.</p>
            </div>
            <div className="p-5 rounded-2xl border bg-gray-50">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-xl">💅</div>
              <h3 className="text-lg font-bold mt-4">Nail Care</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Professional manicure and nail care services.</p>
            </div>
            <div className="p-5 rounded-2xl border bg-gray-50">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-xl">💆</div>
              <h3 className="text-lg font-bold mt-4">Spa & Beauty</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Relaxing spa and beauty treatments.</p>
            </div>
            <div className="p-5 rounded-2xl border bg-gray-50">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-xl">💄</div>
              <h3 className="text-lg font-bold mt-4">Makeup</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Professional makeup for every occasion.</p>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          FEATURES SECTION
      ===================================================== */}
      <section id="features" className="w-full py-12 sm:py-16 bg-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
          <div className="w-full max-w-xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Features</p>
            <h2 className="text-xl sm:text-3xl font-bold mt-1.5">Everything In One Place</h2>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="text-2xl">📅</div>
              <h3 className="text-lg font-bold mt-4">Easy Appointments</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Book and manage salon appointments without calls.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="text-2xl">🔔</div>
              <h3 className="text-lg font-bold mt-4">Smart Notifications</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Get updates when your booking status changes.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="text-2xl">👨‍💼</div>
              <h3 className="text-lg font-bold mt-4">Staff Portfolio</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Explore staff profiles and select professionals.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="text-2xl">🛡️</div>
              <h3 className="text-lg font-bold mt-4">Account Security</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Manage credentials securely from your dashboard.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="text-2xl">📊</div>
              <h3 className="text-lg font-bold mt-4">Personal Dashboard</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Track pending and confirmed bookings easily.</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <div className="text-2xl">⚡</div>
              <h3 className="text-lg font-bold mt-4">Simple & Fast</h3>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5">Clean interface designed for smooth experience.</p>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          STAFF PORTFOLIO SECTION
      ===================================================== */}
      <section className="w-full py-12 sm:py-16 bg-black text-white">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center box-border">
          <div className="text-3xl sm:text-4xl mb-3">👨‍💼</div>
          <h2 className="text-xl sm:text-3xl font-bold">Find The Right Professional</h2>
          <p className="text-gray-400 text-xs sm:text-base mt-2 max-w-xl mx-auto">
            Explore staff portfolios, view their work and choose the professional you want.
          </p>
          <div className="w-full flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Link href="/customer/portfolio" className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-black font-semibold text-center text-sm">
              👨‍💼 View Staff Portfolio
            </Link>
            <Link href="/customer/book" className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-700 text-center hover:bg-white/10 transition text-sm">
              📅 Book Appointment
            </Link>
          </div>
        </div>
      </section>


      {/* =====================================================
          ABOUT SECTION
      ===================================================== */}
      <section id="about" className="w-full py-12 sm:py-16 bg-white">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center box-border">
          <div className="text-3xl sm:text-4xl mb-3">✨</div>
          <h2 className="text-xl sm:text-3xl font-bold">Your Salon, Your Experience</h2>
          <p className="text-gray-500 text-xs sm:text-base mt-2 max-w-xl mx-auto">
            Salon Management System helps customers and staff handle everything from one place.
          </p>
          <Link href="/signup" className="inline-block w-full sm:w-auto mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold text-center text-sm">
            Get Started
          </Link>
        </div>
      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="w-full bg-black text-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 box-border">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <h2 className="text-lg font-bold">✨ Salon Management</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-sm">
                A modern platform for managing salon appointments, services, and staff.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm text-white">Quick Links</h3>
              <div className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <a href="#home" className="block hover:text-white">Home</a>
                <a href="#services" className="block hover:text-white">Services</a>
                <a href="#features" className="block hover:text-white">Features</a>
                <a href="#about" className="block hover:text-white">About</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm text-white">Account</h3>
              <div className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <Link href="/login" className="block hover:text-white">Login</Link>
                <Link href="/signup" className="block hover:text-white">Sign Up</Link>
                <Link href="/forgot-password" className="block hover:text-white">Forgot Password</Link>
                <Link href="/change-password" className="block hover:text-white">Change Password</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Salon Management System. All rights reserved.
          </div>
        </div>
      </footer>

    </main>
  );
}
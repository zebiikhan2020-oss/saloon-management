"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    profilePicture: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    profession: "",
    expertise: "",
    bio: "",
    yearsOfExperience: "",
    specializedServices: "",
  });

  // =========================
  // GET PROFILE
  // =========================

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/staff/profile");
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load profile.");
        return;
      }

      const profile = data.profile;
      const staff = data.staff;

      if (profile) {
        setFormData({
          profilePicture: profile.profilePicture || "",
          fullName: profile.fullName || staff?.name || "",
          phoneNumber: profile.phoneNumber || "",
          email: profile.email || staff?.email || "",
          profession: profile.profession || "",
          expertise: Array.isArray(profile.expertise)
            ? profile.expertise.join(", ")
            : "",
          bio: profile.bio || "",
          yearsOfExperience: profile.yearsOfExperience ?? "",
          specializedServices: Array.isArray(profile.specializedServices)
            ? profile.specializedServices.join(", ")
            : "",
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          fullName: staff?.name || "",
          email: staff?.email || "",
        }));
      }
    } catch (err) {
      console.log("PROFILE FETCH ERROR:", err);
      setError("Something went wrong while loading profile.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE / UPDATE PROFILE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const expertiseArray = formData.expertise
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const specializedServicesArray = formData.specializedServices
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const res = await fetch("/api/staff/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePicture: formData.profilePicture,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          profession: formData.profession,
          expertise: expertiseArray,
          bio: formData.bio,
          yearsOfExperience: formData.yearsOfExperience,
          specializedServices: specializedServicesArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save profile.");
        return;
      }

      setMessage("Profile saved successfully!");
    } catch (err) {
      console.log("PROFILE SAVE ERROR:", err);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full mx-auto mb-3" />

          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Staff Profile
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage your professional credentials and personal details.
              </p>
            </div>

            <button
              onClick={() => router.push("/staff/dashboard")}
              className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>←</span>
              Dashboard
            </button>
          </div>
        </div>

        {/* ==========================================
            PROFILE CARD
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 overflow-hidden">

          {/* PROFILE BANNER */}

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">

              {/* PROFILE IMAGE */}

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-sm shrink-0">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl">
                    👤
                  </span>
                )}
              </div>

              {/* PROFILE INFO */}

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight break-words">
                  {formData.fullName || "Your Name"}
                </h2>

                <p className="text-blue-100 mt-1 text-xs sm:text-sm font-medium break-words">
                  {formData.profession || "Professional Staff"}
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              FORM
          ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 lg:p-8 space-y-7 sm:space-y-8"
          >

            {/* SUCCESS MESSAGE */}

            {message && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-semibold flex items-start gap-2">
                <span>✅</span>

                <span>{message}</span>
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-semibold flex items-start gap-2">
                <span>⚠️</span>

                <span>{error}</span>
              </div>
            )}

            {/* ==========================================
                BASIC INFORMATION
            ========================================== */}

            <section className="space-y-4">

              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Basic Information
                </h3>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Your basic personal and professional details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

                {/* PROFILE PICTURE URL */}

                <div className="md:col-span-2">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Profile Picture URL
                  </label>

                  <input
                    type="text"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Provide a direct link to your display photo.
                  </p>
                </div>

                {/* FULL NAME */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                {/* PHONE NUMBER */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Phone Number *
                  </label>

                  <input
                    type="text"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="03XX-XXXXXXX"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                {/* PROFESSION */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Profession *
                  </label>

                  <input
                    type="text"
                    name="profession"
                    required
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="e.g. Senior Hair Stylist"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>

                {/* YEARS OF EXPERIENCE */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Years of Experience
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="5"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>
            </section>

            {/* ==========================================
                PROFESSIONAL INFORMATION
            ========================================== */}

            <section className="space-y-4 pt-1">

              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Professional Information
                </h3>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Tell clients about your skills and experience.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-5">

                {/* EXPERTISE */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Expertise
                  </label>

                  <input
                    type="text"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="Hair Cutting, Hair Coloring, Styling"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Separate multiple skills using commas.
                  </p>
                </div>

                {/* SPECIALIZED SERVICES */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Specialized Services
                  </label>

                  <input
                    type="text"
                    name="specializedServices"
                    value={formData.specializedServices}
                    onChange={handleChange}
                    placeholder="Bridal Makeup, Keratin Treatment, Facial"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    Separate multiple specialized services using commas.
                  </p>
                </div>

                {/* BIO */}

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Professional Bio
                  </label>

                  <textarea
                    name="bio"
                    rows="5"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell clients about yourself, your background, and your professional journey..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition resize-none"
                  />
                </div>
              </div>
            </section>

            {/* ==========================================
                ACTION BUTTONS
            ========================================== */}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 sm:pt-6 border-t border-slate-100 dark:border-slate-800">

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Saving Changes..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/staff/dashboard")}
                className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
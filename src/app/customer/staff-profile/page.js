"use client";

import { useEffect, useState } from "react";

export default function CustomerStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH STAFF
  // =========================

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/customer/staff-profile");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch staff");
      }

      if (Array.isArray(data.staff)) {
        setStaff(data.staff);
      } else if (data.staff) {
        setStaff([data.staff]);
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.error("CUSTOMER STAFF ERROR:", err);
      setError(err.message || "Failed to load staff profiles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 sm:mb-8">
          <span className="inline-flex items-center rounded-full border border-blue-100 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 sm:text-xs">
            ✨ Meet Our Experts
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Our Professional Staff
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
            Meet our talented salon professionals dedicated to giving you the
            best look.
          </p>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 shadow-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-sm shadow-sm">
              ❌
            </span>

            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                Unable to load staff
              </p>

              <p className="mt-0.5 break-words text-xs text-rose-600 dark:text-rose-400 sm:text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-12 text-center shadow-sm">
            <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading staff profiles...
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Please wait a moment
            </p>
          </div>
        ) : staff.length === 0 ? (
          /* =========================
             EMPTY STATE
          ========================= */

          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-12 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-3xl">
              👨‍💼
            </div>

            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              No staff profiles found
            </h2>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
              Staff profiles will appear here once they become available.
            </p>
          </div>
        ) : (
          /* =========================
             STAFF GRID
          ========================= */

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
            {staff.map((item) => {
              const profile = item.staffProfile || item.profile || item;

              return (
                <div
                  key={item.id}
                  className="
                    group
                    flex
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-800
                    bg-white
                    dark:bg-slate-900
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-slate-300
                    dark:hover:border-slate-700
                    hover:shadow-lg
                  "
                >
                  {/* =========================
                      PROFILE TOP
                  ========================= */}

                  <div className="relative border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-5 pb-5 pt-6 sm:px-6 sm:pb-6">

                    {/* Small decorative accent */}

                    <div className="flex justify-center pt-3">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt={
                            profile.fullName ||
                            item.name ||
                            "Staff"
                          }
                          className="
                            h-28
                            w-28
                            rounded-full
                            border-4
                            border-white
                            dark:border-slate-900
                            object-cover
                            shadow-md
                            ring-1
                            ring-slate-200
                            dark:ring-slate-700
                            transition-transform
                            duration-300
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-28
                            w-28
                            items-center
                            justify-center
                            rounded-full
                            border-4
                            border-white
                            dark:border-slate-900
                            bg-slate-800
                            text-3xl
                            font-extrabold
                            text-white
                            shadow-md
                            ring-1
                            ring-slate-200
                            dark:ring-slate-700
                            transition-transform
                            duration-300
                            group-hover:scale-105
                          "
                        >
                          {(profile.fullName || item.name || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* =========================
                      CONTENT
                  ========================= */}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">

                    {/* NAME */}

                    <div>
                      <h2 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                        {profile.fullName ||
                          item.name ||
                          "Staff Member"}
                      </h2>

                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-pink-600 dark:text-pink-400 sm:text-xs">
                        {profile.profession ||
                          "Salon Professional"}
                      </p>
                    </div>

                    {/* EXPERIENCE */}

                    {profile.yearsOfExperience !== null &&
                      profile.yearsOfExperience !== undefined && (
                        <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          <span>⭐</span>

                          <span>
                            {profile.yearsOfExperience}{" "}
                            {profile.yearsOfExperience === 1
                              ? "Year"
                              : "Years"}{" "}
                            Experience
                          </span>
                        </div>
                      )}

                    {/* BIO */}

                    {profile.bio && (
                      <div className="mt-5">
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {profile.bio}
                        </p>
                      </div>
                    )}

                    {/* EXPERTISE */}

                    {profile.expertise?.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 sm:text-xs">
                          Expertise
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {profile.expertise
                            .slice(0, 4)
                            .map((exp, index) => (
                              <span
                                key={index}
                                className="
                                  rounded-lg
                                  border
                                  border-blue-100
                                  dark:border-blue-900/60
                                  bg-blue-50
                                  dark:bg-blue-950/40
                                  px-2.5
                                  py-1.5
                                  text-[11px]
                                  font-semibold
                                  text-blue-700
                                  dark:text-blue-300
                                "
                              >
                                {exp}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* SPECIALIZED SERVICES */}

                    {profile.specializedServices?.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 sm:text-xs">
                          Specialized Services
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {profile.specializedServices
                            .slice(0, 3)
                            .map((serv, index) => (
                              <span
                                key={index}
                                className="
                                  rounded-lg
                                  border
                                  border-slate-200
                                  dark:border-slate-700
                                  bg-slate-100
                                  dark:bg-slate-800
                                  px-2.5
                                  py-1.5
                                  text-[11px]
                                  font-semibold
                                  text-slate-700
                                  dark:text-slate-200
                                "
                              >
                                {serv}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* =========================
                        CONTACT
                    ========================= */}

                    <div className="mt-auto pt-6">
                      <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">

                        {/* EMAIL */}

                        {(profile.email || item.email) && (
                          <div className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs">
                              ✉️
                            </span>

                            <span className="min-w-0 break-all text-xs font-medium text-slate-600 dark:text-slate-300">
                              {profile.email || item.email}
                            </span>
                          </div>
                        )}

                        {/* PHONE */}

                        {profile.phoneNumber && (
                          <div className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                              📞
                            </span>

                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              {profile.phoneNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
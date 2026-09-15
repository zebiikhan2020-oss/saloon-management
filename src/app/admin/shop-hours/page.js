
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AdminShopHours() {
  const [shopHours, setShopHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShopHours();
  }, []);

  async function fetchShopHours() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/shop-hours");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load shop hours");
      }

      setShopHours(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shop hours:", error);
      setError("Failed to load shop hours");
      setShopHours([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id, field, value) {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updatedShopHour = shopHours.find(
        (shopHour) => shopHour.id === id
      );

      if (!updatedShopHour) {
        setError("Shop hour not found");
        return;
      }

      const body = {
        id,
        type: updatedShopHour.type,
        openTime: updatedShopHour.openTime,
        closeTime: updatedShopHour.closeTime,
      };

      body[field] = value;

      // If day is FULL_DAY or CLOSED, keep default times
      if (body.type === "FULL_DAY" || body.type === "CLOSED") {
        body.openTime = "09:00";
        body.closeTime = "22:00";
      }

      const response = await fetch("/api/admin/shop-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update shop hours");
        return;
      }

      setMessage("Business hours updated successfully");

      await fetchShopHours();
    } catch (error) {
      console.error("Error updating shop hours:", error);
      setError("Failed to update shop hours");
    } finally {
      setSaving(false);
    }
  }

  function formatTime(time) {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Business Hours
            </h1>

            <p className="text-gray-500 mt-1">
              Configure salon operating hours for each day
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-500">
              Loading business hours...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Day
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Open Time
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Close Time
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {shopHours.map((shopHour) => (
                    <tr key={shopHour.id}>
                      {/* Day */}
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {shopHour.day}
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={shopHour.type}
                          onChange={(e) =>
                            handleUpdate(
                              shopHour.id,
                              "type",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        >
                          <option value="NORMAL">Normal</option>
                          <option value="FULL_DAY">24 Hours</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>

                      {/* Open Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shopHour.type === "NORMAL" ? (
                          <input
                            type="time"
                            value={shopHour.openTime}
                            onChange={(e) =>
                              handleUpdate(
                                shopHour.id,
                                "openTime",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                          />
                        ) : (
                          <span className="text-gray-400">
                            {shopHour.type === "FULL_DAY"
                              ? "00:00"
                              : "Closed"}
                          </span>
                        )}
                      </td>

                      {/* Close Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shopHour.type === "NORMAL" ? (
                          <input
                            type="time"
                            value={shopHour.closeTime}
                            onChange={(e) =>
                              handleUpdate(
                                shopHour.id,
                                "closeTime",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                          />
                        ) : (
                          <span className="text-gray-400">
                            {shopHour.type === "FULL_DAY"
                              ? "23:59"
                              : "Closed"}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shopHour.type === "NORMAL" && (
                          <span className="inline-flex px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            Open
                          </span>
                        )}

                        {shopHour.type === "FULL_DAY" && (
                          <span className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            24 Hours
                          </span>
                        )}

                        {shopHour.type === "CLOSED" && (
                          <span className="inline-flex px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Instructions
          </h3>

          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Normal: Salon operates during the selected opening and closing
              times.
            </li>

            <li>
              • 24 Hours: Salon is available throughout the entire day.
            </li>

            <li>
              • Closed: No appointments are available on that day.
            </li>

            <li>
              • Default hours are 9:00 AM to 10:00 PM.
            </li>

            <li>
              • All days are initially configured as Normal (9:00 AM to 10:00 PM).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

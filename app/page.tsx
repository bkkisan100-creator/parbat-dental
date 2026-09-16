"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "ne";

type DashboardCardProps = {
  title: string;
  value: string;
  icon: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
};

type QuickActionProps = {
  icon: string;
  title: string;
  bg: string;
  hover: string;
  onClick?: () => void;
};

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  const isNepali = language === "ne";

  useEffect(() => {
    setMounted(true);

    const savedLogin = localStorage.getItem("parbatDentalLoggedIn");

    if (savedLogin === "true") {
      setLoggedIn(true);
    }

    const savedLanguage = localStorage.getItem(
      "parbatDentalLanguage"
    );

    if (savedLanguage === "en" || savedLanguage === "ne") {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("parbatDentalLanguage", lang);
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername === "admin" && cleanPassword === "1234") {
      localStorage.setItem("parbatDentalLoggedIn", "true");
      setLoggedIn(true);
    } else {
      alert(
        isNepali
          ? "प्रयोगकर्ता नाम वा पासवर्ड गलत छ।"
          : "Username or password is incorrect."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("parbatDentalLoggedIn");
    setLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-blue-600 font-semibold">
          Loading...
        </div>
      </main>
    );
  }

  if (loggedIn) {
    return (
      <main className="min-h-screen bg-sky-50">
        <header className="bg-white border-b border-blue-100 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700">
              🦷 Parbat Dental
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-1">
              {isNepali
                ? "दन्त चिकित्सा व्यवस्थापन प्रणाली"
                : "Dental Clinic Management System"}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  language === "en"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                EN
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("ne")}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  language === "ne"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                नेपाली
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
            >
              {isNepali ? "लगआउट" : "Logout"}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {isNepali ? "ड्यासबोर्ड" : "Dashboard"}
          </h2>

          <p className="text-gray-500 mt-1">
            {isNepali
              ? "स्वागत छ, Admin 👋"
              : "Welcome, Admin 👋"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mt-8">
            <DashboardCard
              title={
                isNepali
                  ? "आजका बिरामी"
                  : "Today's Patients"
              }
              value="0"
              icon="👥"
              bg="bg-blue-50"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              onClick={() =>
                router.push("/patients?today=true")
              }
            />

            <DashboardCard
              title={isNepali ? "डाक्टरहरू" : "Doctors"}
              value="0"
              icon="👨‍⚕️"
              bg="bg-green-50"
              iconBg="bg-green-100"
              iconColor="text-green-600"
              onClick={() => router.push("/doctors")}
            />

            <DashboardCard
              title={
                isNepali
                  ? "अपोइन्टमेन्टहरू"
                  : "Appointments"
              }
              value="0"
              icon="📅"
              bg="bg-purple-50"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />

            <DashboardCard
              title={
                isNepali
                  ? "आजको संकलन"
                  : "Today's Collection"
              }
              value="NPR 0"
              icon="💰"
              bg="bg-orange-50"
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-800">
              {isNepali
                ? "छिटो कार्यहरू"
                : "Quick Actions"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
              <QuickAction
                icon="➕"
                title={
                  isNepali
                    ? "नयाँ बिरामी"
                    : "New Patient"
                }
                bg="bg-blue-50"
                hover="hover:bg-blue-100"
                onClick={() => router.push("/patients")}
              />

              <QuickAction
                icon="📅"
                title={
                  isNepali
                    ? "अपोइन्टमेन्ट"
                    : "Appointment"
                }
                bg="bg-green-50"
                hover="hover:bg-green-100"
              />

              <QuickAction
                icon="👨‍⚕️"
                title={
                  isNepali
                    ? "डाक्टरहरू"
                    : "Doctors"
                }
                bg="bg-purple-50"
                hover="hover:bg-purple-100"
                onClick={() => router.push("/doctors")}
              />

              <QuickAction
                icon="💰"
                title={
                  isNepali
                    ? "बिलिङ"
                    : "Billing"
                }
                bg="bg-orange-50"
                hover="hover:bg-orange-100"
              />
            </div>
          </div>

          <div className="mt-10">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h3 className="text-xl font-bold text-gray-800">
                {isNepali
                  ? "आजका अपोइन्टमेन्टहरू"
                  : "Today's Appointments"}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {isNepali
                  ? "आजको अपोइन्टमेन्ट विवरण यहाँ देखिनेछ।"
                  : "Today's appointment details will appear here."}
              </p>

              <div className="mt-6 border-2 border-dashed border-gray-200 rounded-2xl py-12 text-center">
                <div className="text-5xl mb-3">
                  📅
                </div>

                <p className="text-gray-500 font-medium">
                  {isNepali
                    ? "आज कुनै अपोइन्टमेन्ट छैन।"
                    : "No appointments for today."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              🦷
            </div>

            <h1 className="text-3xl font-extrabold text-blue-700">
              Parbat Dental
            </h1>

            <p className="text-gray-500 mt-2">
              {isNepali
                ? "दन्त चिकित्सा व्यवस्थापन प्रणाली"
                : "Dental Clinic Management System"}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  language === "en"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("ne")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  language === "ne"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                नेपाली
              </button>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isNepali
                  ? "प्रयोगकर्ता नाम"
                  : "Username"}
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder={
                  isNepali
                    ? "प्रयोगकर्ता नाम"
                    : "Username"
                }
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isNepali
                  ? "पासवर्ड"
                  : "Password"}
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder={
                  isNepali
                    ? "पासवर्ड"
                    : "Password"
                }
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:bg-blue-800 transition shadow-lg"
            >
              {isNepali
                ? "लगइन गर्नुहोस्"
                : "Login"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Dental Clinic Management System
          </p>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  bg,
  iconBg,
  iconColor,
  onClick,
}: DashboardCardProps) {
  const content = (
    <>
      <div
        className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center text-3xl`}
      >
        {icon}
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-500">
          {title}
        </p>

        <p
          className={`text-3xl font-extrabold ${iconColor} mt-1`}
        >
          {value}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-lg transition text-left cursor-pointer w-full`}
      >
        {content}

        <div className="mt-4 text-xs font-semibold text-blue-600">
          View today's patients →
        </div>
      </button>
    );
  }

  return (
    <div
      className={`${bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition`}
    >
      {content}
    </div>
  );
}

function QuickAction({
  icon,
  title,
  bg,
  hover,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${bg} ${hover} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition text-left`}
    >
      <div className="text-3xl">
        {icon}
      </div>

      <p className="font-bold text-gray-800 mt-3">
        {title}
      </p>
    </button>
  );
}
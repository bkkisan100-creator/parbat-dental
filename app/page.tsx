"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "ne";

type ClinicSettings = {
  clinicName: string;
  phone: string;
  address: string;
  doctorName: string;
  dashboardTitle: string;
  logo: string;
  paymentQR: string;
  receiptTitle: string;
  receiptFooter: string;
};

const defaultSettings: ClinicSettings = {
  clinicName: "Parbat Dental",
  phone: "98XXXXXXXX",
  address: "Kusma, Parbat, Nepal",
  doctorName: "Dr. Dental",
  dashboardTitle: "Welcome to Parbat Dental",

  // Demo images
  logo: "/logo.png",
  paymentQR: "/qr.png",

  receiptTitle: "Parbat Dental - Payment Receipt",
  receiptFooter: "Thank you for visiting us.",
};

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const [language, setLanguage] =
    useState<Language>("en");

  const [mounted, setMounted] = useState(false);

  const [settings, setSettings] =
    useState<ClinicSettings>(defaultSettings);

  const isNepali = language === "ne";

  /* =========================
     LOAD DATA
  ========================== */

  useEffect(() => {
    setMounted(true);

    // Login
    const savedLogin = localStorage.getItem(
      "parbatDentalLoggedIn"
    );

    if (savedLogin === "true") {
      setLoggedIn(true);
    }

    // Language
    const savedLanguage = localStorage.getItem(
      "parbatDentalLanguage"
    );

    if (
      savedLanguage === "en" ||
      savedLanguage === "ne"
    ) {
      setLanguage(savedLanguage);
    }

    // Clinic settings
    const savedSettings = localStorage.getItem(
      "parbatDentalSettings"
    );

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        setSettings({
          ...defaultSettings,
          ...parsed,

          // If old settings have no logo/QR,
          // use demo images.
          logo:
            parsed.logo || defaultSettings.logo,

          paymentQR:
            parsed.paymentQR ||
            defaultSettings.paymentQR,
        });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  /* =========================
     LANGUAGE
  ========================== */

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);

    localStorage.setItem(
      "parbatDentalLanguage",
      lang
    );
  };

  /* =========================
     LOGIN
  ========================== */

  const handleLogin = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const cleanUsername =
      username.trim();

    const cleanPassword =
      password.trim();

    if (
      cleanUsername === "admin" &&
      cleanPassword === "1234"
    ) {
      localStorage.setItem(
        "parbatDentalLoggedIn",
        "true"
      );

      setLoggedIn(true);
    } else {
      alert(
        isNepali
          ? "प्रयोगकर्ता नाम वा पासवर्ड गलत छ।"
          : "Username or password is incorrect."
      );
    }
  };

  /* =========================
     LOGOUT
  ========================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "parbatDentalLoggedIn"
    );

    setLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  /* =========================
     LOADING
  ========================== */

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-blue-600 font-semibold">
          Loading...
        </div>
      </main>
    );
  }

  /* =====================================================
     LOGIN PAGE
  ====================================================== */

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex items-center justify-center px-4 py-8">

        {/* LANGUAGE */}
        <div className="absolute top-6 right-6">

          <div className="bg-white shadow-md rounded-xl p-1 flex">

            <button
              onClick={() =>
                changeLanguage("en")
              }
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                language === "en"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600"
              }`}
            >
              English
            </button>

            <button
              onClick={() =>
                changeLanguage("ne")
              }
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

        <div className="w-full max-w-md">

          <div className="bg-white rounded-3xl shadow-2xl p-7 md:p-10 border border-blue-50">

            {/* LOGO */}

            <div className="text-center">

              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center shadow-sm overflow-hidden">

                <img
                  src={settings.logo}
                  alt="Clinic Logo"
                  className="w-full h-full object-contain p-2"
                />

              </div>

              <h1 className="text-3xl font-extrabold text-blue-700 mt-5">
                {settings.clinicName}
              </h1>

              <p className="text-gray-500 mt-2">
                {isNepali
                  ? "दन्त चिकित्सा व्यवस्थापन प्रणाली"
                  : "Dental Clinic Management System"}
              </p>

            </div>

            {/* LOGIN FORM */}

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              {/* USERNAME */}

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

              {/* PASSWORD */}

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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg"
              >
                {isNepali
                  ? "लगइन गर्नुहोस्"
                  : "Login"}
              </button>

            </form>

            <p className="text-center text-xs text-gray-400 mt-7">
              {settings.clinicName} • Clinic Management System
            </p>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     DASHBOARD
  ====================================================== */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">

      {/* =================================================
          TOP NAVBAR
      ================================================== */}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-blue-100 shadow-sm">

        <div className="px-4 md:px-7 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* BRAND */}

          <div className="flex items-center gap-4">

            {/* LOGO */}

            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-100 overflow-hidden">

              <img
                src={settings.logo}
                alt="Clinic Logo"
                className="w-full h-full object-contain p-1"
              />

            </div>

            {/* CLINIC NAME */}

            <div>

              <h1 className="text-xl md:text-2xl font-extrabold text-blue-700">
                {settings.clinicName}
              </h1>

              <p className="text-xs md:text-sm text-gray-500">
                {isNepali
                  ? "दन्त चिकित्सा व्यवस्थापन प्रणाली"
                  : "Dental Clinic Management System"}
              </p>

            </div>

          </div>

          {/* NAV BUTTONS */}

          <div className="flex items-center gap-2 flex-wrap">

            {/* LANGUAGE */}

            <div className="flex bg-gray-100 rounded-xl p-1">

              <button
                onClick={() =>
                  changeLanguage("en")
                }
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  language === "en"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                EN
              </button>

              <button
                onClick={() =>
                  changeLanguage("ne")
                }
                className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                  language === "ne"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                नेपाली
              </button>

            </div>

            {/* SETTINGS */}

            <button
              type="button"
              onClick={() =>
                router.push("/settings")
              }
              className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
            >
              ⚙️{" "}
              {isNepali
                ? "सेटिङ"
                : "Settings"}
            </button>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100"
            >
              {isNepali
                ? "लगआउट"
                : "Logout"}
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================== */}

      <div className="p-4 md:p-7 max-w-[1600px] mx-auto">

        {/* WELCOME */}

        <div className="mb-6">

          <p className="text-blue-600 font-semibold">
            {isNepali
              ? "स्वागत छ 👋"
              : "Welcome back 👋"}
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
            {isNepali
              ? "ड्यासबोर्ड"
              : "Dashboard"}
          </h2>

          <p className="text-gray-500 mt-1">
            {settings.dashboardTitle}
          </p>

        </div>

        {/* =================================================
            CLINIC INFORMATION
        ================================================== */}

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>

            <p className="text-sm text-gray-500">
              {isNepali
                ? "क्लिनिक"
                : "Clinic"}
            </p>

            <p className="font-bold text-gray-800">
              {settings.clinicName}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              {isNepali
                ? "डाक्टर"
                : "Doctor"}
            </p>

            <p className="font-bold text-gray-800">
              {settings.doctorName}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              {isNepali
                ? "फोन"
                : "Phone"}
            </p>

            <p className="font-bold text-gray-800">
              {settings.phone}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              {isNepali
                ? "ठेगाना"
                : "Address"}
            </p>

            <p className="font-bold text-gray-800">
              {settings.address}
            </p>

          </div>

        </div>

        {/* =================================================
            HERO
        ================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white shadow-xl">

          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full" />

          <div className="absolute -right-20 -bottom-32 w-80 h-80 bg-white/10 rounded-full" />

          <div className="relative p-6 md:p-9">

            <div className="max-w-2xl">

              <p className="text-blue-100 font-semibold">
                {settings.clinicName.toUpperCase()}
              </p>

              <h3 className="text-3xl md:text-4xl font-extrabold mt-2">
                {isNepali
                  ? "स्वस्थ मुस्कान, राम्रो जीवन 🦷"
                  : "Healthy Smile, Better Life 🦷"}
              </h3>

              <p className="text-blue-100 mt-3 max-w-xl">
                {isNepali
                  ? "बिरामी, अपोइन्टमेन्ट, उपचार र बिलिङलाई सजिलो र व्यवस्थित रूपमा व्यवस्थापन गर्नुहोस्।"
                  : "Manage patients, appointments, treatments and billing easily from one professional system."}
              </p>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">

              <HeroStat
                title={
                  isNepali
                    ? "कुल बिरामी"
                    : "Patients"
                }
                value="128"
              />

              <HeroStat
                title={
                  isNepali
                    ? "आजका अपोइन्टमेन्ट"
                    : "Appointments"
                }
                value="14"
              />

              <HeroStat
                title={
                  isNepali
                    ? "आजको आम्दानी"
                    : "Revenue"
                }
                value="25K"
              />

              <HeroStat
                title={
                  isNepali
                    ? "डाक्टरहरू"
                    : "Doctors"
                }
                value="4"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            STAT CARDS
        ================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-7">

          <DashboardCard
            title={
              isNepali
                ? "आजका बिरामी"
                : "Today's Patients"
            }
            value="24"
            icon="👥"
            bg="bg-blue-50"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() =>
              router.push(
                "/patients?today=true"
              )
            }
          />

          <DashboardCard
            title={
              isNepali
                ? "डाक्टरहरू"
                : "Doctors"
            }
            value="4"
            icon="👨‍⚕️"
            bg="bg-emerald-50"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            onClick={() =>
              router.push("/doctors")
            }
          />

          <DashboardCard
            title={
              isNepali
                ? "अपोइन्टमेन्ट"
                : "Appointments"
            }
            value="14"
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
            value="NPR 25K"
            icon="💰"
            bg="bg-orange-50"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================== */}

        <section className="mt-8">

          <h3 className="text-xl font-extrabold text-gray-900">
            {isNepali
              ? "छिटो कार्यहरू"
              : "Quick Actions"}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

            <QuickAction
              icon="➕"
              title={
                isNepali
                  ? "नयाँ बिरामी"
                  : "New Patient"
              }
              bg="bg-blue-50"
              onClick={() =>
                router.push("/patients")
              }
            />

            <QuickAction
              icon="📅"
              title={
                isNepali
                  ? "अपोइन्टमेन्ट"
                  : "Appointment"
              }
              bg="bg-emerald-50"
            />

            <QuickAction
              icon="👨‍⚕️"
              title={
                isNepali
                  ? "डाक्टरहरू"
                  : "Doctors"
              }
              bg="bg-purple-50"
              onClick={() =>
                router.push("/doctors")
              }
            />

            <QuickAction
              icon="💰"
              title={
                isNepali
                  ? "बिलिङ"
                  : "Billing"
              }
              bg="bg-orange-50"
            />

          </div>

        </section>

        {/* =================================================
            REVENUE + QR
        ================================================== */}

        <section className="grid lg:grid-cols-3 gap-6 mt-8">

          {/* REVENUE */}

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-extrabold text-gray-900">
                  {isNepali
                    ? "आजको आम्दानी"
                    : "Today's Revenue"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {isNepali
                    ? "डेमो डेटा"
                    : "Demo data"}
                </p>

              </div>

              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl font-bold">
                +18.5%
              </div>

            </div>

            <div className="mt-7">

              <p className="text-4xl font-extrabold text-gray-900">
                NPR 25,000
              </p>

              <p className="text-gray-500 mt-1">
                {isNepali
                  ? "आजसम्म"
                  : "Collected today"}
              </p>

            </div>

            <div className="h-40 mt-8 flex items-end gap-3">

              {[
                35,
                55,
                45,
                70,
                50,
                85,
                65,
                95,
                75,
                100,
                80,
                90,
              ].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                )
              )}

            </div>

          </div>

          {/* QR PAYMENT */}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-extrabold text-gray-900">
                  QR Payment
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {isNepali
                    ? "भुक्तानी QR"
                    : "Payment QR"}
                </p>

              </div>

              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                DEMO
              </span>

            </div>

            {/* REAL QR IMAGE */}

            <div className="mt-5 bg-gray-50 rounded-2xl p-4 flex justify-center">

              <div className="w-48 h-48 bg-white rounded-xl border flex items-center justify-center overflow-hidden">

                <img
                  src={settings.paymentQR}
                  alt="Payment QR"
                  className="w-full h-full object-contain p-2"
                />

              </div>

            </div>

            <button
              type="button"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
            >
              {isNepali
                ? "भुक्तानी थप्नुहोस्"
                : "Add Payment"}
            </button>

          </div>

        </section>

        {/* =================================================
            TREATMENTS
        ================================================== */}

        <section className="mt-8">

          <div className="flex justify-between items-center mb-4">

            <div>

              <h3 className="text-xl font-extrabold text-gray-900">
                {isNepali
                  ? "दन्त उपचारहरू"
                  : "Dental Treatments"}
              </h3>

              <p className="text-sm text-gray-500">
                {isNepali
                  ? "क्लिनिकमा उपलब्ध प्रमुख उपचारहरू"
                  : "Popular treatments at the clinic"}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <TreatmentCard
              emoji="🦷"
              title="Dental Checkup"
              description="Complete dental examination"
              image="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80"
            />

            <TreatmentCard
              emoji="✨"
              title="Teeth Cleaning"
              description="Professional teeth cleaning"
              image="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80"
            />

            <TreatmentCard
              emoji="🦷"
              title="Root Canal"
              description="Advanced root canal treatment"
              image="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80"
            />

            <TreatmentCard
              emoji="😁"
              title="Dental Braces"
              description="Modern orthodontic treatment"
              image="https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=900&q=80"
            />

          </div>

        </section>

        {/* =================================================
            APPOINTMENTS + PATIENTS
        ================================================== */}

        <section className="grid lg:grid-cols-2 gap-6 mt-8">

          {/* APPOINTMENTS */}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <div className="flex justify-between items-center">

              <div>

                <h3 className="text-xl font-extrabold">
                  {isNepali
                    ? "आजका अपोइन्टमेन्टहरू"
                    : "Today's Appointments"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {isNepali
                    ? "आजको बिरामी तालिका"
                    : "Today's patient schedule"}
                </p>

              </div>

              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">
                14
              </span>

            </div>

            <div className="mt-5 space-y-3">

              <Appointment
                time="09:30 AM"
                patient="Ram Sharma"
                treatment="Dental Checkup"
              />

              <Appointment
                time="11:00 AM"
                patient="Sita BK"
                treatment="Root Canal"
              />

              <Appointment
                time="01:30 PM"
                patient="Hari Thapa"
                treatment="Teeth Cleaning"
              />

            </div>

          </div>

          {/* RECENT PATIENTS */}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

            <h3 className="text-xl font-extrabold">
              {isNepali
                ? "हालका बिरामीहरू"
                : "Recent Patients"}
            </h3>

            <div className="mt-5 space-y-3">

              <PatientRow
                name="Ram Sharma"
                treatment="Dental Checkup"
              />

              <PatientRow
                name="Sita BK"
                treatment="Root Canal"
              />

              <PatientRow
                name="Hari Thapa"
                treatment="Cleaning"
              />

              <PatientRow
                name="Gita Gurung"
                treatment="Braces"
              />

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="text-center py-8 text-sm text-gray-400">
          © 2026 {settings.clinicName} • Dental Clinic Management System
        </footer>

      </div>

    </main>
  );
}

/* =====================================================
   HERO STAT
====================================================== */

function HeroStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-4">

      <p className="text-xs md:text-sm text-blue-100">
        {title}
      </p>

      <p className="text-2xl md:text-3xl font-extrabold mt-1">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   DASHBOARD CARD
====================================================== */

function DashboardCard({
  title,
  value,
  icon,
  bg,
  iconBg,
  iconColor,
  onClick,
}: {
  title: string;
  value: string;
  icon: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div
        className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center text-3xl`}
      >
        {icon}
      </div>

      <p className="text-sm font-semibold text-gray-500 mt-5">
        {title}
      </p>

      <p
        className={`text-3xl font-extrabold ${iconColor} mt-1`}
      >
        {value}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        View details →
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${bg} rounded-3xl p-6 border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition text-left w-full`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`${bg} rounded-3xl p-6 border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition`}
    >
      {content}
    </div>
  );
}

/* =====================================================
   QUICK ACTION
====================================================== */

function QuickAction({
  icon,
  title,
  bg,
  onClick,
}: {
  icon: string;
  title: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${bg} rounded-2xl p-5 text-left border border-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition`}
    >

      <div className="text-3xl">
        {icon}
      </div>

      <p className="font-bold text-gray-800 mt-3">
        {title}
      </p>

      <p className="text-xs text-gray-500 mt-1">
        Open →
      </p>

    </button>
  );
}

/* =====================================================
   TREATMENT CARD
====================================================== */

function TreatmentCard({
  emoji,
  title,
  description,
  image,
}: {
  emoji: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition">

      <div className="h-44 overflow-hidden bg-gray-100">

        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition duration-500"
        />

      </div>

      <div className="p-5">

        <div className="text-2xl">
          {emoji}
        </div>

        <h4 className="font-extrabold text-lg mt-2">
          {title}
        </h4>

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   APPOINTMENT
====================================================== */

function Appointment({
  time,
  patient,
  treatment,
}: {
  time: string;
  patient: string;
  treatment: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">

      <div className="bg-blue-100 text-blue-700 rounded-xl px-3 py-2 text-sm font-bold">
        {time}
      </div>

      <div className="flex-1">

        <p className="font-bold text-gray-800">
          {patient}
        </p>

        <p className="text-xs text-gray-500">
          {treatment}
        </p>

      </div>

      <span className="w-3 h-3 bg-green-500 rounded-full" />

    </div>
  );
}

/* =====================================================
   PATIENT ROW
====================================================== */

function PatientRow({
  name,
  treatment,
}: {
  name: string;
  treatment: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">

      <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-xl">
        👤
      </div>

      <div className="flex-1">

        <p className="font-bold text-gray-800">
          {name}
        </p>

        <p className="text-xs text-gray-500">
          {treatment}
        </p>

      </div>

      <span className="text-green-600 text-xs font-bold">
        Active
      </span>

    </div>
  );
}
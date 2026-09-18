"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [started, setStarted] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  // --------------------------------
  // 5 SECONDS AFTER APP OPENS
  // GET STARTED BUTTON APPEARS
  // --------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGetStarted(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // --------------------------------
  // WELCOME SCREEN
  // --------------------------------
  if (!started) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">

          {/* LOGO */}
          <img
            src="/parbat-dental-logo.png"
            alt="Parbat Dental"
            className="w-64 h-64 object-contain mx-auto"
          />

          {/* HELLO */}
          <h1 className="text-4xl font-bold mt-6 text-gray-800">
            Hello, Namaste! 🙏
          </h1>

          {/* WELCOME */}
          <p className="text-2xl font-semibold mt-3 text-gray-700">
            Welcome to Parbat Dental
          </p>

          <p className="text-gray-500 mt-2">
            Dental Care & Management System
          </p>

          {/* 
            सुरुमा 5 sec सम्म यो खाली हुन्छ।
            5 sec पछि मात्र button देखिन्छ।
          */}
          {showGetStarted && (
            <button
              onClick={() => setStarted(true)}
              className="
                mt-8
                px-8
                py-3
                bg-blue-600
                text-white
                rounded-xl
                font-semibold
                text-lg
                shadow-md
                hover:bg-blue-700
                transition-all
                duration-200
              "
            >
              Get Started →
            </button>
          )}

        </div>
      </main>
    );
  }

  // --------------------------------
  // MAIN DASHBOARD
  // GET STARTED CLICK गरेपछि मात्र
  // --------------------------------
  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b shadow-sm">

        <div className="max-w-7xl mx-auto px-6">

          <div className="h-20 flex items-center justify-between">

            {/* LOGO */}
            <div className="flex items-center gap-3">

              <img
                src="/parbat-dental-logo.png"
                alt="Parbat Dental"
                className="w-12 h-12 object-contain"
              />

              <div>
                <h1 className="font-bold text-gray-800 text-lg">
                  Parbat Dental
                </h1>

                <p className="text-xs text-gray-500">
                  Dental Care & Management
                </p>
              </div>

            </div>

            {/* NAVIGATION */}
            <div className="flex items-center gap-1">

              {[
                "Dashboard",
                "New Bill",
                "Bills",
                "Customers",
                "Reports",
                "Settings",
              ].map((item) => (

                <button
                  key={item}
                  onClick={() => setActivePage(item)}
                  className={`
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    font-medium
                    transition-all
                    ${
                      activePage === item
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

        </div>

      </nav>


      {/* CONTENT AREA */}
      <section className="max-w-7xl mx-auto px-6 py-8">

        {/* =========================
            DASHBOARD
        ========================= */}
        {activePage === "Dashboard" && (

          <div>

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-gray-800">
                Dashboard
              </h2>

              <p className="text-gray-500 mt-1">
                Welcome to Parbat Dental Management System.
              </p>

            </div>


            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-2xl border shadow-sm p-6">

                <p className="text-gray-500 text-sm">
                  Today's Patients
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-3">
                  0
                </h3>

              </div>


              <div className="bg-white rounded-2xl border shadow-sm p-6">

                <p className="text-gray-500 text-sm">
                  Today's Bills
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-3">
                  0
                </h3>

              </div>


              <div className="bg-white rounded-2xl border shadow-sm p-6">

                <p className="text-gray-500 text-sm">
                  Today's Revenue
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-3">
                  Rs. 0
                </h3>

              </div>

            </div>


            {/* QUICK ACTIONS */}
            <div className="mt-8 bg-white rounded-2xl border shadow-sm p-6">

              <h3 className="text-xl font-bold text-gray-800">
                Quick Actions
              </h3>

              <div className="flex gap-4 mt-5">

                <button
                  onClick={() => setActivePage("New Bill")}
                  className="
                    bg-blue-600
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                    hover:bg-blue-700
                  "
                >
                  + New Bill
                </button>


                <button
                  onClick={() => setActivePage("Customers")}
                  className="
                    bg-gray-100
                    text-gray-700
                    px-6
                    py-3
                    rounded-xl
                    font-semibold
                    hover:bg-gray-200
                  "
                >
                  Patients
                </button>

              </div>

            </div>

          </div>
        )}


        {/* =========================
            NEW BILL
        ========================= */}
        {activePage === "New Bill" && (

          <div>

            <h2 className="text-3xl font-bold text-gray-800">
              New Bill
            </h2>

            <p className="text-gray-500 mt-2">
              Create a new dental treatment bill.
            </p>


            <div className="mt-8 bg-white rounded-2xl border shadow-sm p-8">

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <label className="block text-sm font-medium mb-2">
                    Patient Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter patient name"
                    className="w-full border rounded-xl px-4 py-3"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter phone number"
                    className="w-full border rounded-xl px-4 py-3"
                  />

                </div>

              </div>


              <div className="mt-6">

                <label className="block text-sm font-medium mb-2">
                  Treatment / Service
                </label>

                <input
                  type="text"
                  placeholder="Enter treatment"
                  className="w-full border rounded-xl px-4 py-3"
                />

              </div>


              <div className="mt-6">

                <label className="block text-sm font-medium mb-2">
                  Amount
                </label>

                <input
                  type="number"
                  placeholder="Rs."
                  className="w-full border rounded-xl px-4 py-3"
                />

              </div>


              <button
                className="
                  mt-8
                  bg-blue-600
                  text-white
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  hover:bg-blue-700
                "
              >
                Create Bill
              </button>

            </div>

          </div>
        )}


        {/* =========================
            OTHER PAGES
        ========================= */}

        {activePage === "Bills" && (
          <SimplePage
            title="Bills"
            description="View and manage all dental bills."
          />
        )}


        {activePage === "Customers" && (
          <SimplePage
            title="Customers"
            description="Manage patient information."
          />
        )}


        {activePage === "Reports" && (
          <SimplePage
            title="Reports"
            description="View dental clinic reports and revenue."
          />
        )}


        {activePage === "Settings" && (
          <SimplePage
            title="Settings"
            description="Manage Parbat Dental system settings."
          />
        )}

      </section>

    </main>
  );
}


// --------------------------------
// SIMPLE PAGE
// --------------------------------

function SimplePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>

      <h2 className="text-3xl font-bold text-gray-800">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        {description}
      </p>

      <div
        className="
          mt-8
          bg-white
          rounded-2xl
          border
          shadow-sm
          min-h-[300px]
          flex
          items-center
          justify-center
        "
      >
        <p className="text-gray-400">
          {title} interface यहाँ आउनेछ।
        </p>
      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import BillingSystem from "@/app/components/BillingSystem";

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGetStarted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!started) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/parbat-dental-logo.png"
            alt="Parbat Dental"
            className="w-100 h-120 object-contain mx-auto"
          />
          <h1 className="text-4xl font-bold mt-6 text-gray-800">
            Hello, Namaste! 
          </h1>
          <p className="text-2xl font-semibold mt-3 text-gray-700">
            Welcome to Parbat Dental
          </p>
          <p className="text-gray-500 mt-2">
            Dental Care & Management System Nepal
          </p>

          {showGetStarted && (
            <button
              onClick={() => setStarted(true)}
              className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 transition-all duration-100"
            >
              Get Started →
            </button>
          )}
        </div>
      </main>
    );
  }

  return <BillingSystem view="dashboard" />;
}
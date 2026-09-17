"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClinicPhoto = {
  id: number;
  name: string;
  image: string;
};

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
  clinicPhotos: ClinicPhoto[];
};

const defaultSettings: ClinicSettings = {
  clinicName: "Parbat Dental",
  phone: "98XXXXXXXX",
  address: "Kusma, Parbat, Nepal",
  doctorName: "Dr. Dental",
  dashboardTitle: "Welcome to Parbat Dental",
  logo: "/demo-logo.png",
  paymentQR: "/demo-qr.png",
  receiptTitle: "Parbat Dental - Payment Receipt",
  receiptFooter: "Thank you for visiting us.",
  clinicPhotos: [],
};

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<ClinicSettings>(defaultSettings);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("parbatDentalSettings");

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        setSettings({
          ...defaultSettings,
          ...parsed,
          clinicPhotos: parsed.clinicPhotos || [],
        });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  function updateSetting(
    key: keyof ClinicSettings,
    value: string | ClinicPhoto[]
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSave() {
    localStorage.setItem(
      "parbatDentalSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    key: "logo" | "paymentQR"
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image 2MB भन्दा सानो हुनुपर्छ।");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("कृपया image file मात्र छान्नुहोस्।");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateSetting(key, reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  function handleClinicPhotos(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const currentPhotos = settings.clinicPhotos || [];

    if (currentPhotos.length + files.length > 12) {
      alert("अधिकतम 12 वटा Clinic Photos राख्न सकिन्छ।");
      return;
    }

    let processed = 0;
    const newPhotos: ClinicPhoto[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        processed++;

        if (processed === files.length) {
          saveClinicPhotos(newPhotos);
        }

        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} 2MB भन्दा ठूलो छ।`);
        processed++;

        if (processed === files.length) {
          saveClinicPhotos(newPhotos);
        }

        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        newPhotos.push({
          id: Date.now() + Math.random(),
          name: file.name,
          image: reader.result as string,
        });

        processed++;

        if (processed === files.length) {
          saveClinicPhotos(newPhotos);
        }
      };

      reader.readAsDataURL(file);
    });
  }

  function saveClinicPhotos(newPhotos: ClinicPhoto[]) {
    if (newPhotos.length === 0) return;

    setSettings((prev) => ({
      ...prev,
      clinicPhotos: [
        ...(prev.clinicPhotos || []),
        ...newPhotos,
      ],
    }));
  }

  function removeClinicPhoto(id: number) {
    const updatedPhotos = settings.clinicPhotos.filter(
      (photo) => photo.id !== id
    );

    updateSetting("clinicPhotos", updatedPhotos);
  }

  function resetLogo() {
    updateSetting("logo", "/demo-logo.png");
  }

  function resetQR() {
    updateSetting("paymentQR", "/demo-qr.png");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Settings
            </h1>

            <p className="mt-1 text-slate-500">
              Manage your dental clinic information
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white hover:bg-slate-700"
          >
            ← Dashboard
          </button>

        </div>

        {/* CLINIC INFORMATION */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-slate-800">
            🏥 Clinic Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Clinic Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Clinic Name
              </label>

              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) =>
                  updateSetting("clinicName", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter clinic name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  updateSetting("phone", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Clinic Address
              </label>

              <input
                type="text"
                value={settings.address}
                onChange={(e) =>
                  updateSetting("address", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter clinic address"
              />
            </div>

            {/* Doctor */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Doctor Name
              </label>

              <input
                type="text"
                value={settings.doctorName}
                onChange={(e) =>
                  updateSetting("doctorName", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter doctor name"
              />
            </div>

          </div>

          {/* Dashboard Welcome */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Dashboard Welcome Text
            </label>

            <input
              type="text"
              value={settings.dashboardTitle}
              onChange={(e) =>
                updateSetting("dashboardTitle", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter dashboard welcome text"
            />
          </div>

        </div>

        {/* LOGO AND QR */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">

          {/* LOGO */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-bold text-slate-800">
              🖼️ Clinic Logo
            </h2>

            <div className="mb-5 flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">

              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Clinic Logo"
                  className="max-h-48 max-w-[260px] object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-5xl">
                    🏥
                  </div>

                  <p className="mt-2">
                    No logo selected
                  </p>
                </div>
              )}

            </div>

            <label className="block cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">

              📁 Change Logo

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  handleImageUpload(e, "logo")
                }
                className="hidden"
              />

            </label>

            <button
              onClick={resetLogo}
              className="mt-3 w-full rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              ↩ Use Demo Logo
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              PNG, JPG or WebP • Maximum 2MB
            </p>

          </div>

          {/* QR */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-xl font-bold text-slate-800">
              📱 Payment QR
            </h2>

            <div className="mb-5 flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">

              {settings.paymentQR ? (
                <img
                  src={settings.paymentQR}
                  alt="Payment QR"
                  className="h-48 w-48 object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <div className="text-5xl">
                    📱
                  </div>

                  <p className="mt-2">
                    No payment QR selected
                  </p>
                </div>
              )}

            </div>

            <label className="block cursor-pointer rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700">

              📁 Change Payment QR

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  handleImageUpload(e, "paymentQR")
                }
                className="hidden"
              />

            </label>

            <button
              onClick={resetQR}
              className="mt-3 w-full rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              ↩ Use Demo QR
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              eSewa / Khalti / Fonepay / Bank QR
            </p>

          </div>

        </div>

        {/* CLINIC PHOTOS */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                📸 Clinic Photos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add clinic interior, exterior and treatment photos.
              </p>
            </div>

            <label className="cursor-pointer rounded-xl bg-purple-600 px-5 py-3 text-center font-semibold text-white hover:bg-purple-700">

              📁 Add Photos

              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleClinicPhotos}
                className="hidden"
              />

            </label>

          </div>

          {/* PHOTO COUNT */}
          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            📷 Photos:{" "}
            <span className="font-bold text-slate-800">
              {settings.clinicPhotos.length}
            </span>{" "}
            / 12
          </div>

          {/* PHOTOS */}
          {settings.clinicPhotos.length > 0 ? (

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

              {settings.clinicPhotos.map((photo) => (

                <div
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >

                  <div className="relative aspect-square overflow-hidden bg-slate-100">

                    <img
                      src={photo.image}
                      alt={photo.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <button
                      onClick={() =>
                        removeClinicPhoto(photo.id)
                      }
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-lg hover:bg-red-700"
                    >
                      ✕
                    </button>

                  </div>

                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {photo.name}
                    </p>
                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">

              <div className="text-6xl">
                📸
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-700">
                No Clinic Photos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add interior, exterior or treatment photos.
              </p>

            </div>

          )}

          <p className="mt-4 text-xs text-slate-400">
            JPG, PNG or WebP • Maximum 2MB per photo • Maximum 12 photos
          </p>

        </div>

        {/* RECEIPT SETTINGS */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-xl font-bold text-slate-800">
            🧾 Receipt Settings
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Receipt Title
              </label>

              <input
                type="text"
                value={settings.receiptTitle}
                onChange={(e) =>
                  updateSetting(
                    "receiptTitle",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Receipt Footer
              </label>

              <input
                type="text"
                value={settings.receiptFooter}
                onChange={(e) =>
                  updateSetting(
                    "receiptFooter",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

        </div>

        {/* SAVE */}
        <div className="mb-6 flex flex-wrap items-center gap-4">

          <button
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            💾 Save Settings
          </button>

          {saved && (
            <span className="font-semibold text-green-600">
              ✓ Settings saved successfully
            </span>
          )}

        </div>

        {/* MORE SETTINGS */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-slate-800">
            🚀 More Settings
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {/* CLINIC PHOTOS */}
            <div className="rounded-xl bg-slate-50 p-5">

              <div className="mb-2 text-3xl">
                🖼️
              </div>

              <h3 className="font-bold text-slate-800">
                Clinic Photos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add clinic interior, exterior and treatment photos.
              </p>

              <button
                onClick={() =>
                  window.scrollTo({
                    top: 650,
                    behavior: "smooth",
                  })
                }
                className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Manage Photos
              </button>

            </div>

            {/* PAYMENT METHODS */}
            <div className="rounded-xl bg-slate-50 p-5">

              <div className="mb-2 text-3xl">
                💳
              </div>

              <h3 className="font-bold text-slate-800">
                Payment Methods
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Configure Cash, Bank, eSewa, Khalti and Fonepay.
              </p>

              <button
                onClick={() =>
                  alert(
                    "Payment Methods अर्को चरणमा तयार गरिन्छ।"
                  )
                }
                className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Configure
              </button>

            </div>

            {/* PRINTER SETTINGS */}
            <div className="rounded-xl bg-slate-50 p-5">

              <div className="mb-2 text-3xl">
                🖨️
              </div>

              <h3 className="font-bold text-slate-800">
                Printer Settings
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                A4 and thermal receipt printing options.
              </p>

              <button
                onClick={() =>
                  alert(
                    "Printer Settings अर्को चरणमा तयार गरिन्छ।"
                  )
                }
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Configure
              </button>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
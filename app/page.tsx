"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "ne";

type BillItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
};

type PrescriptionItem = {
  id: number;
  medicine: string;
  dose: string;
  frequency: string;
  days: number;
  instruction: string;
};

type DentalRecord = {
  id: number;
  billNo: string;
  date: string;

  patientName: string;
  address: string;
  phone: string;
  doctor: string;
  diagnosis: string;
  treatmentNotes: string;

  checkupFee: number;
  treatmentItems: BillItem[];
  medicineItems: BillItem[];

  discount: number;
  paid: number;
  paymentMethod: string;

  prescription: PrescriptionItem[];

  subtotal: number;
  total: number;
  due: number;
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
};

const defaultSettings: ClinicSettings = {
  clinicName: "Parbat Dental",
  phone: "98XXXXXXXX",
  address: "Kusma, Parbat, Nepal",
  doctorName: "Dr. Dental",
  dashboardTitle: "Parbat Dental",
  logo: "/logo.png",
  paymentQR: "/qr.png",
  receiptTitle: "Parbat Dental - Payment Receipt",
  receiptFooter: "Thank you for visiting us.",
};

const emptyItem = (): BillItem => ({
  id: Date.now() + Math.random(),
  name: "",
  qty: 1,
  price: 0,
});

const emptyPrescription = (): PrescriptionItem => ({
  id: Date.now() + Math.random(),
  medicine: "",
  dose: "",
  frequency: "",
  days: 1,
  instruction: "",
});

export default function Home() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [language, setLanguage] = useState<Language>("en");
  const [settings, setSettings] =
    useState<ClinicSettings>(defaultSettings);

  const [records, setRecords] = useState<DentalRecord[]>([]);

  const [patientName, setPatientName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [doctor, setDoctor] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");

  const [checkupFee, setCheckupFee] = useState(0);
  const [treatmentItems, setTreatmentItems] = useState<BillItem[]>([
    emptyItem(),
  ]);
  const [medicineItems, setMedicineItems] = useState<BillItem[]>([
    emptyItem(),
  ]);

  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [prescription, setPrescription] = useState<
    PrescriptionItem[]
  >([emptyPrescription()]);

  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [printRecord, setPrintRecord] = useState<DentalRecord | null>(
    null
  );
  const [printType, setPrintType] = useState<"bill" | "prescription" | null>(
    null
  );

  useEffect(() => {
    setMounted(true);

    const login = localStorage.getItem("parbatDentalLoggedIn");
    if (login === "true") {
      setLoggedIn(true);
    }

    const savedLanguage = localStorage.getItem(
      "parbatDentalLanguage"
    ) as Language | null;

    if (savedLanguage === "ne" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    const savedSettings = localStorage.getItem(
      "parbatDentalSettings"
    );

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...defaultSettings,
          ...parsed,
        });
      } catch {}
    }

    const savedRecords = localStorage.getItem("parbatDentalBills");

    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      "parbatDentalLanguage",
      language
    );
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const savedSettings = localStorage.getItem(
      "parbatDentalSettings"
    );

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        setSettings({
          ...defaultSettings,
          ...parsed,
        });

        setDoctor(parsed.doctorName || defaultSettings.doctorName);
      } catch {}
    } else {
      setDoctor(defaultSettings.doctorName);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      "parbatDentalBills",
      JSON.stringify(records)
    );
  }, [records, mounted]);

  useEffect(() => {
    if (!printRecord || !printType) return;

    const timer = setTimeout(() => {
      window.print();
    }, 150);

    const afterPrint = () => {
      setPrintRecord(null);
      setPrintType(null);
    };

    window.addEventListener("afterprint", afterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [printRecord, printType]);

  const treatmentTotal = useMemo(() => {
    return treatmentItems.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
      0
    );
  }, [treatmentItems]);

  const medicineTotal = useMemo(() => {
    return medicineItems.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
      0
    );
  }, [medicineItems]);

  const subtotal = useMemo(() => {
    return Number(checkupFee || 0) + treatmentTotal + medicineTotal;
  }, [checkupFee, treatmentTotal, medicineTotal]);

  const total = Math.max(
    subtotal - Number(discount || 0),
    0
  );

  const due = Math.max(
    total - Number(paid || 0),
    0
  );

  const filteredRecords = records.filter((record) => {
    const text = `
      ${record.patientName}
      ${record.phone}
      ${record.billNo}
      ${record.doctor}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const username = String(form.get("username") || "");
    const password = String(form.get("password") || "");

    if (username === "admin" && password === "1234") {
      localStorage.setItem(
        "parbatDentalLoggedIn",
        "true"
      );

      setLoggedIn(true);
      setMessage("");
    } else {
      setMessage(
        language === "ne"
          ? "Username वा password गलत छ।"
          : "Incorrect username or password."
      );
    }
  }

  function logout() {
    localStorage.removeItem("parbatDentalLoggedIn");
    setLoggedIn(false);
  }

  function addTreatment() {
    setTreatmentItems((items) => [
      ...items,
      emptyItem(),
    ]);
  }

  function addMedicine() {
    setMedicineItems((items) => [
      ...items,
      emptyItem(),
    ]);
  }

  function addPrescription() {
    setPrescription((items) => [
      ...items,
      emptyPrescription(),
    ]);
  }

  function updateTreatment(
    id: number,
    field: keyof BillItem,
    value: string | number
  ) {
    setTreatmentItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "qty" || field === "price"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  }

  function updateMedicine(
    id: number,
    field: keyof BillItem,
    value: string | number
  ) {
    setMedicineItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "qty" || field === "price"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  }

  function updatePrescription(
    id: number,
    field: keyof PrescriptionItem,
    value: string | number
  ) {
    setPrescription((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "days"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  }

  function removeTreatment(id: number) {
    setTreatmentItems((items) =>
      items.length === 1
        ? items
        : items.filter((item) => item.id !== id)
    );
  }

  function removeMedicine(id: number) {
    setMedicineItems((items) =>
      items.length === 1
        ? items
        : items.filter((item) => item.id !== id)
    );
  }

  function removePrescription(id: number) {
    setPrescription((items) =>
      items.length === 1
        ? items
        : items.filter((item) => item.id !== id)
    );
  }

  function createCurrentRecord(): DentalRecord {
    const now = new Date();

    const billNo =
      "PD-" +
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0");

    return {
      id: Date.now(),

      billNo,
      date: now.toLocaleString(),

      patientName: patientName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      doctor: doctor.trim() || settings.doctorName,
      diagnosis: diagnosis.trim(),
      treatmentNotes: treatmentNotes.trim(),

      checkupFee: Number(checkupFee || 0),

      treatmentItems: treatmentItems.filter(
        (item) => item.name.trim() !== ""
      ),

      medicineItems: medicineItems.filter(
        (item) => item.name.trim() !== ""
      ),

      discount: Number(discount || 0),
      paid: Number(paid || 0),
      paymentMethod,

      prescription: prescription.filter(
        (item) => item.medicine.trim() !== ""
      ),

      subtotal,
      total,
      due,
    };
  }

  function saveBill() {
    if (!patientName.trim()) {
      setMessage(
        language === "ne"
          ? "कृपया बिरामीको नाम राख्नुहोस्।"
          : "Please enter patient name."
      );
      return null;
    }

    const record = createCurrentRecord();

    setRecords((old) => [
      record,
      ...old,
    ]);

    setMessage(
      language === "ne"
        ? `Bill ${record.billNo} save भयो।`
        : `Bill ${record.billNo} saved successfully.`
    );

    return record;
  }

  function saveAndPrintBill() {
    const record = saveBill();

    if (!record) return;

    setPrintRecord(record);
    setPrintType("bill");
  }

  function printCurrentBill() {
    if (!patientName.trim()) {
      setMessage(
        language === "ne"
          ? "पहिला बिरामीको नाम राख्नुहोस्।"
          : "Enter patient name first."
      );
      return;
    }

    const record = createCurrentRecord();

    setPrintRecord(record);
    setPrintType("bill");
  }

  function printCurrentPrescription() {
    if (!patientName.trim()) {
      setMessage(
        language === "ne"
          ? "पहिला बिरामीको नाम राख्नुहोस्।"
          : "Enter patient name first."
      );
      return;
    }

    const record = createCurrentRecord();

    setPrintRecord(record);
    setPrintType("prescription");
  }

  function loadRecord(record: DentalRecord) {
    setPatientName(record.patientName);
    setAddress(record.address);
    setPhone(record.phone);
    setDoctor(record.doctor);
    setDiagnosis(record.diagnosis);
    setTreatmentNotes(record.treatmentNotes);

    setCheckupFee(record.checkupFee);

    setTreatmentItems(
      record.treatmentItems.length
        ? record.treatmentItems
        : [emptyItem()]
    );

    setMedicineItems(
      record.medicineItems.length
        ? record.medicineItems
        : [emptyItem()]
    );

    setDiscount(record.discount);
    setPaid(record.paid);
    setPaymentMethod(record.paymentMethod);

    setPrescription(
      record.prescription.length
        ? record.prescription
        : [emptyPrescription()]
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setMessage(
      language === "ne"
        ? `${record.patientName} को record खोलियो।`
        : `${record.patientName}'s record loaded.`
    );
  }

  function newBill() {
    setPatientName("");
    setAddress("");
    setPhone("");
    setDoctor(settings.doctorName);
    setDiagnosis("");
    setTreatmentNotes("");

    setCheckupFee(0);
    setTreatmentItems([emptyItem()]);
    setMedicineItems([emptyItem()]);

    setDiscount(0);
    setPaid(0);
    setPaymentMethod("Cash");

    setPrescription([emptyPrescription()]);

    setMessage("");
  }

  function money(value: number) {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img
              src={settings.logo || "/logo.png"}
              alt="Logo"
              className="mx-auto h-20 w-20 object-contain mb-4"
            />

            <h1 className="text-3xl font-bold text-slate-900">
              {settings.clinicName}
            </h1>

            <p className="text-slate-500 mt-2">
              Dental Clinic Management System
            </p>

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() =>
                  setLanguage(
                    language === "en" ? "ne" : "en"
                  )
                }
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-800 font-semibold"
              >
                {language === "en"
                  ? "नेपाली"
                  : "English"}
              </button>
            </div>
          </div>

          <form
            onSubmit={login}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>

              <input
                name="username"
                type="text"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234"
              />
            </div>

            {message && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold"
            >
              Login
            </button>

            <p className="text-center text-xs text-slate-400">
              Demo Login: admin / 1234
            </p>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-100 text-slate-900">
        {/* NAVBAR */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={settings.logo || "/logo.png"}
                alt="Logo"
                className="h-11 w-11 object-contain"
              />

              <div>
                <h1 className="font-bold text-xl">
                  {settings.clinicName}
                </h1>

                <p className="text-xs text-slate-500">
                  Billing & Prescription
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={newBill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                + {language === "ne" ? "नयाँ Bill" : "New Bill"}
              </button>

              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-semibold"
              >
                ⚙️ Settings
              </button>

              <button
                onClick={() =>
                  setLanguage(
                    language === "en" ? "ne" : "en"
                  )
                }
                className="px-3 py-2 bg-slate-100 rounded-lg font-semibold"
              >
                {language === "en" ? "नेपाली" : "English"}
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* TOP STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={
                language === "ne"
                  ? "आजका बिरामी"
                  : "Today's Patients"
              }
              value={records.filter((r) =>
                r.date.startsWith(
                  new Date().toLocaleDateString()
                )
              ).length}
              icon="👤"
            />

            <StatCard
              title={
                language === "ne"
                  ? "कुल Records"
                  : "Total Records"
              }
              value={records.length}
              icon="📋"
            />

            <StatCard
              title={
                language === "ne"
                  ? "कुल Billing"
                  : "Total Billing"
              }
              value={money(
                records.reduce(
                  (sum, r) => sum + r.total,
                  0
                )
              )}
              icon="💰"
            />

            <StatCard
              title={
                language === "ne"
                  ? "बाकी रकम"
                  : "Total Due"
              }
              value={money(
                records.reduce(
                  (sum, r) => sum + r.due,
                  0
                )
              )}
              icon="⚠️"
            />
          </div>

          {message && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
              {message}
            </div>
          )}

          {/* BILLING AREA */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT / MAIN FORM */}
            <div className="lg:col-span-2 space-y-6">
              {/* PATIENT */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <SectionTitle
                  icon="👤"
                  title={
                    language === "ne"
                      ? "बिरामीको जानकारी"
                      : "Patient Information"
                  }
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label={
                      language === "ne"
                        ? "बिरामीको नाम *"
                        : "Patient Name *"
                    }
                    value={patientName}
                    onChange={setPatientName}
                    placeholder="Full name"
                  />

                  <Input
                    label={
                      language === "ne"
                        ? "फोन नम्बर"
                        : "Phone"
                    }
                    value={phone}
                    onChange={setPhone}
                    placeholder="98XXXXXXXX"
                  />

                  <Input
                    label={
                      language === "ne"
                        ? "ठेगाना"
                        : "Address"
                    }
                    value={address}
                    onChange={setAddress}
                    placeholder="Address"
                  />

                  <Input
                    label={
                      language === "ne"
                        ? "Doctor"
                        : "Doctor"
                    }
                    value={doctor}
                    onChange={setDoctor}
                    placeholder="Doctor name"
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === "ne"
                        ? "समस्या / Diagnosis"
                        : "Problem / Diagnosis"}
                    </label>

                    <textarea
                      value={diagnosis}
                      onChange={(e) =>
                        setDiagnosis(e.target.value)
                      }
                      rows={2}
                      className="w-full border border-slate-300 rounded-xl p-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Diagnosis / Dental problem"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {language === "ne"
                        ? "Checkup / Treatment Notes"
                        : "Checkup / Treatment Notes"}
                    </label>

                    <textarea
                      value={treatmentNotes}
                      onChange={(e) =>
                        setTreatmentNotes(e.target.value)
                      }
                      rows={3}
                      className="w-full border border-slate-300 rounded-xl p-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Treatment details..."
                    />
                  </div>
                </div>
              </section>

              {/* CHECKUP */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <SectionTitle
                  icon="🦷"
                  title={
                    language === "ne"
                      ? "Checkup / Treatment"
                      : "Checkup / Treatment"
                  }
                />

                <div className="mb-5 max-w-xs">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {language === "ne"
                      ? "Checkup Fee"
                      : "Checkup Fee"}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={checkupFee}
                    onChange={(e) =>
                      setCheckupFee(
                        Number(e.target.value)
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900"
                  />
                </div>

                <ItemTable
                  title={
                    language === "ne"
                      ? "Treatment / Service"
                      : "Treatment / Service"
                  }
                  items={treatmentItems}
                  onAdd={addTreatment}
                  onUpdate={updateTreatment}
                  onRemove={removeTreatment}
                  language={language}
                />
              </section>

              {/* MEDICINES */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <ItemTable
                  title={
                    language === "ne"
                      ? "औषधि / Dental सामान"
                      : "Medicine / Dental Items"
                  }
                  items={medicineItems}
                  onAdd={addMedicine}
                  onUpdate={updateMedicine}
                  onRemove={removeMedicine}
                  language={language}
                />
              </section>

              {/* PRESCRIPTION */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <SectionTitle
                  icon="💊"
                  title={
                    language === "ne"
                      ? "Prescription / औषधि"
                      : "Prescription"
                  }
                />

                <div className="space-y-4">
                  {prescription.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800">
                          Medicine #{index + 1}
                        </h3>

                        {prescription.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removePrescription(
                                item.id
                              )
                            }
                            className="text-red-500 text-sm font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-5 gap-3">
                        <SmallInput
                          label="Medicine"
                          value={item.medicine}
                          onChange={(v) =>
                            updatePrescription(
                              item.id,
                              "medicine",
                              v
                            )
                          }
                        />

                        <SmallInput
                          label="Dose"
                          value={item.dose}
                          onChange={(v) =>
                            updatePrescription(
                              item.id,
                              "dose",
                              v
                            )
                          }
                          placeholder="1 tablet"
                        />

                        <SmallInput
                          label="Frequency"
                          value={item.frequency}
                          onChange={(v) =>
                            updatePrescription(
                              item.id,
                              "frequency",
                              v
                            )
                          }
                          placeholder="1-0-1"
                        />

                        <SmallInput
                          label="Days"
                          type="number"
                          value={item.days}
                          onChange={(v) =>
                            updatePrescription(
                              item.id,
                              "days",
                              Number(v)
                            )
                          }
                        />

                        <SmallInput
                          label="Instruction"
                          value={item.instruction}
                          onChange={(v) =>
                            updatePrescription(
                              item.id,
                              "instruction",
                              v
                            )
                          }
                          placeholder="After food"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                  >
                    + Add Medicine
                  </button>

                  <button
                    type="button"
                    onClick={printCurrentPrescription}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold"
                  >
                    🖨️ Print Prescription
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">
              {/* TOTAL */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-24">
                <SectionTitle
                  icon="💰"
                  title={
                    language === "ne"
                      ? "Billing Summary"
                      : "Billing Summary"
                  }
                />

                <div className="space-y-3 text-sm">
                  <SummaryRow
                    label="Checkup"
                    value={checkupFee}
                  />

                  <SummaryRow
                    label="Treatment"
                    value={treatmentTotal}
                  />

                  <SummaryRow
                    label="Medicine / Items"
                    value={medicineTotal}
                  />

                  <div className="border-t pt-3">
                    <SummaryRow
                      label="Subtotal"
                      value={subtotal}
                      bold
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          Number(e.target.value)
                        )
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                    />
                  </div>

                  <div className="border-t pt-3">
                    <SummaryRow
                      label="TOTAL"
                      value={total}
                      big
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Paid
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={paid}
                      onChange={(e) =>
                        setPaid(
                          Number(e.target.value)
                        )
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Payment Method
                    </label>

                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                    >
                      <option>Cash</option>
                      <option>eSewa</option>
                      <option>Khalti</option>
                      <option>Fonepay</option>
                      <option>Bank</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-red-700">
                        Due
                      </span>

                      <span className="font-bold text-red-700 text-lg">
                        {money(due)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <button
                    type="button"
                    onClick={saveBill}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold"
                  >
                    💾 Save Bill
                  </button>

                  <button
                    type="button"
                    onClick={saveAndPrintBill}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-bold"
                  >
                    💾🖨️ Save & Print Bill
                  </button>

                  <button
                    type="button"
                    onClick={printCurrentBill}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-3 font-bold"
                  >
                    🖨️ Print Bill
                  </button>

                  <button
                    type="button"
                    onClick={newBill}
                    className="w-full bg-slate-100 text-slate-800 rounded-xl py-3 font-bold"
                  >
                    + New Bill
                  </button>
                </div>
              </section>

              {/* SEARCH HISTORY */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <SectionTitle
                  icon="📋"
                  title={
                    language === "ne"
                      ? "पुराना Patient / Bill"
                      : "Previous Patients / Bills"
                  }
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder={
                    language === "ne"
                      ? "नाम, फोन वा Bill No. खोज्नुहोस्..."
                      : "Search name, phone or bill no..."
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 mb-4"
                />

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No records found
                    </div>
                  ) : (
                    filteredRecords.map((record) => (
                      <div
                        key={record.id}
                        className="border border-slate-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <h3 className="font-bold">
                              {record.patientName}
                            </h3>

                            <p className="text-xs text-slate-500">
                              {record.phone}
                            </p>

                            <p className="text-xs text-slate-500">
                              {record.billNo}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {record.date}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="font-bold">
                              {money(record.total)}
                            </div>

                            {record.due > 0 && (
                              <div className="text-xs text-red-600">
                                Due: {money(record.due)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            onClick={() =>
                              loadRecord(record)
                            }
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold"
                          >
                            Open
                          </button>

                          <button
                            onClick={() => {
                              setPrintRecord(record);
                              setPrintType("bill");
                            }}
                            className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold"
                          >
                            🖨 Bill
                          </button>

                          <button
                            onClick={() => {
                              setPrintRecord(record);
                              setPrintType(
                                "prescription"
                              );
                            }}
                            className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold"
                          >
                            🖨 Rx
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* PRINT AREA */}
      {printRecord && printType && (
        <div id="print-area">
          {printType === "bill" ? (
            <PrintableBill
              record={printRecord}
              settings={settings}
            />
          ) : (
            <PrintablePrescription
              record={printRecord}
              settings={settings}
            />
          )}
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        input,
        textarea,
        select {
          color: #0f172a !important;
          background-color: #ffffff !important;
        }

        input::placeholder,
        textarea::placeholder {
          color: #64748b !important;
          opacity: 1;
        }

        @media print {
          body {
            background: white !important;
          }

          body > * {
            visibility: hidden !important;
          }

          #print-area,
          #print-area * {
            visibility: visible !important;
          }

          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="text-2xl font-bold mt-2 text-slate-900">
            {value}
          </h2>
        </div>

        <div className="text-3xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="text-2xl">
        {icon}
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SmallInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 text-sm"
      />
    </div>
  );
}

function ItemTable({
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  language,
}: {
  title: string;
  items: BillItem[];
  onAdd: () => void;
  onUpdate: (
    id: number,
    field: keyof BillItem,
    value: string | number
  ) => void;
  onRemove: (id: number) => void;
  language: Language;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">
          {title}
        </h3>

        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold"
        >
          + {language === "ne" ? "थप्नुहोस्" : "Add"}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const lineTotal =
            Number(item.qty || 0) *
            Number(item.price || 0);

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-end"
            >
              <div className="col-span-5">
                <label className="text-xs text-slate-500">
                  Item
                </label>

                <input
                  value={item.name}
                  onChange={(e) =>
                    onUpdate(
                      item.id,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder={
                    language === "ne"
                      ? `सामान ${index + 1}`
                      : `Item ${index + 1}`
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-500">
                  Qty
                </label>

                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) =>
                    onUpdate(
                      item.id,
                      "qty",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-500">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(e) =>
                    onUpdate(
                      item.id,
                      "price",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs text-slate-500">
                  Total
                </label>

                <div className="px-3 py-2 bg-slate-100 rounded-lg font-semibold text-sm">
                  Rs.{" "}
                  {lineTotal.toLocaleString()}
                </div>
              </div>

              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    onRemove(item.id)
                  }
                  className="w-full px-2 py-2 bg-red-50 text-red-600 rounded-lg"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
  big = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  big?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center ${
        bold ? "font-bold" : ""
      } ${big ? "text-xl" : ""}`}
    >
      <span>{label}</span>

      <span>
        Rs. {Number(value || 0).toLocaleString()}
      </span>
    </div>
  );
}

/* =========================================================
   PRINT BILL
========================================================= */

function PrintableBill({
  record,
  settings,
}: {
  record: DentalRecord;
  settings: ClinicSettings;
}) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-black p-8">
      <div className="text-center border-b-2 border-black pb-5">
        <img
          src={settings.logo || "/logo.png"}
          alt="Logo"
          className="h-20 mx-auto object-contain mb-2"
        />

        <h1 className="text-3xl font-bold">
          {settings.clinicName}
        </h1>

        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>

      <div className="flex justify-between mt-6 text-sm">
        <div>
          <p>
            <strong>Patient:</strong>{" "}
            {record.patientName}
          </p>

          <p>
            <strong>Address:</strong>{" "}
            {record.address || "-"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {record.phone || "-"}
          </p>

          <p>
            <strong>Doctor:</strong>{" "}
            {record.doctor}
          </p>
        </div>

        <div className="text-right">
          <p>
            <strong>Bill No:</strong>{" "}
            {record.billNo}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {record.date}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold border-b pb-2 mb-3">
          PAYMENT RECEIPT
        </h2>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">
                Description
              </th>

              <th className="border p-2">
                Qty
              </th>

              <th className="border p-2 text-right">
                Price
              </th>

              <th className="border p-2 text-right">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border p-2">
                Checkup Fee
              </td>

              <td className="border p-2 text-center">
                1
              </td>

              <td className="border p-2 text-right">
                Rs.{" "}
                {record.checkupFee.toLocaleString()}
              </td>

              <td className="border p-2 text-right">
                Rs.{" "}
                {record.checkupFee.toLocaleString()}
              </td>
            </tr>

            {record.treatmentItems.map(
              (item) => (
                <tr key={item.id}>
                  <td className="border p-2">
                    {item.name}
                  </td>

                  <td className="border p-2 text-center">
                    {item.qty}
                  </td>

                  <td className="border p-2 text-right">
                    Rs.{" "}
                    {item.price.toLocaleString()}
                  </td>

                  <td className="border p-2 text-right">
                    Rs.{" "}
                    {(
                      item.qty * item.price
                    ).toLocaleString()}
                  </td>
                </tr>
              )
            )}

            {record.medicineItems.map(
              (item) => (
                <tr key={item.id}>
                  <td className="border p-2">
                    {item.name}
                  </td>

                  <td className="border p-2 text-center">
                    {item.qty}
                  </td>

                  <td className="border p-2 text-right">
                    Rs.{" "}
                    {item.price.toLocaleString()}
                  </td>

                  <td className="border p-2 text-right">
                    Rs.{" "}
                    {(
                      item.qty * item.price
                    ).toLocaleString()}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        <div className="ml-auto w-72 mt-5 space-y-2">
          <SummaryPrint
            label="Subtotal"
            value={record.subtotal}
          />

          <SummaryPrint
            label="Discount"
            value={record.discount}
          />

          <div className="border-t border-black pt-2">
            <SummaryPrint
              label="TOTAL"
              value={record.total}
              bold
            />
          </div>

          <SummaryPrint
            label="Paid"
            value={record.paid}
          />

          <SummaryPrint
            label="Due"
            value={record.due}
            bold
          />
        </div>
      </div>

      {record.diagnosis && (
        <div className="mt-8">
          <strong>Diagnosis:</strong>
          <p className="mt-1">
            {record.diagnosis}
          </p>
        </div>
      )}

      {record.treatmentNotes && (
        <div className="mt-4">
          <strong>Treatment Notes:</strong>
          <p className="mt-1">
            {record.treatmentNotes}
          </p>
        </div>
      )}

      <div className="mt-12 text-center border-t pt-5">
        <p>{settings.receiptFooter}</p>

        <div className="mt-10 flex justify-between text-sm">
          <span>
            Patient Signature
          </span>

          <span>
            Authorized Signature
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRINT PRESCRIPTION
========================================================= */

function PrintablePrescription({
  record,
  settings,
}: {
  record: DentalRecord;
  settings: ClinicSettings;
}) {
  return (
    <div className="max-w-[800px] mx-auto bg-white text-black p-8">
      <div className="text-center border-b-2 border-black pb-5">
        <img
          src={settings.logo || "/logo.png"}
          alt="Logo"
          className="h-20 mx-auto object-contain mb-2"
        />

        <h1 className="text-3xl font-bold">
          {settings.clinicName}
        </h1>

        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>

      <div className="flex justify-between mt-6">
        <div>
          <p>
            <strong>Patient:</strong>{" "}
            {record.patientName}
          </p>

          <p>
            <strong>Address:</strong>{" "}
            {record.address || "-"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {record.phone || "-"}
          </p>
        </div>

        <div className="text-right">
          <p>
            <strong>Date:</strong>{" "}
            {record.date}
          </p>

          <p>
            <strong>Doctor:</strong>{" "}
            {record.doctor}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <div className="text-5xl font-serif mb-5">
          ℞
        </div>

        {record.diagnosis && (
          <div className="mb-5">
            <strong>Diagnosis:</strong>{" "}
            {record.diagnosis}
          </div>
        )}

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 text-left">
                Medicine
              </th>

              <th className="border p-3 text-left">
                Dose
              </th>

              <th className="border p-3 text-left">
                Frequency
              </th>

              <th className="border p-3 text-left">
                Days
              </th>

              <th className="border p-3 text-left">
                Instruction
              </th>
            </tr>
          </thead>

          <tbody>
            {record.prescription.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border p-5 text-center"
                >
                  No medicine prescribed.
                </td>
              </tr>
            ) : (
              record.prescription.map(
                (item) => (
                  <tr key={item.id}>
                    <td className="border p-3">
                      {item.medicine}
                    </td>

                    <td className="border p-3">
                      {item.dose}
                    </td>

                    <td className="border p-3">
                      {item.frequency}
                    </td>

                    <td className="border p-3">
                      {item.days}
                    </td>

                    <td className="border p-3">
                      {item.instruction}
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>

        {record.treatmentNotes && (
          <div className="mt-8">
            <strong>Instructions / Notes:</strong>

            <p className="mt-2 whitespace-pre-wrap">
              {record.treatmentNotes}
            </p>
          </div>
        )}
      </div>

      <div className="mt-20 flex justify-between">
        <div className="text-center">
          <div className="w-40 border-b border-black mb-2" />
          <p className="text-sm">
            Patient
          </p>
        </div>

        <div className="text-center">
          <div className="w-40 border-b border-black mb-2" />
          <p className="text-sm">
            Dr. {record.doctor}
          </p>
        </div>
      </div>

      <div className="text-center mt-10 text-sm">
        {settings.receiptFooter}
      </div>
    </div>
  );
}

function SummaryPrint({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        bold ? "font-bold text-lg" : ""
      }`}
    >
      <span>{label}</span>

      <span>
        Rs. {Number(value).toLocaleString()}
      </span>
    </div>
  );
}
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "ne";
type BillingView = "dashboard" | "new-bill" | "preview";

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

type PaymentEntry = {
  id: number;
  amount: number;
  date: string;
  method: string;
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

  paymentPlanMonths: number;
  paymentDueDate: string;
  paymentHistory: PaymentEntry[];
  todayPayment?: number;
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

// Date formatter kept outside the component so every printable section
// can safely access it during rendering.
function formatDateOnly(value: string | undefined | null) {
  if (!value) return "-";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function money(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

export default function BillingSystem({ view = "dashboard" }: { view?: BillingView }) {
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
  const [todayPayment, setTodayPayment] = useState(0);
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [paymentPlanMonths, setPaymentPlanMonths] = useState(3);
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [currentBillNo, setCurrentBillNo] = useState("");
  const [patientInfoOpen, setPatientInfoOpen] = useState(false);
  const [recordsLoaded, setRecordsLoaded] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);

  const [prescription, setPrescription] = useState<
    PrescriptionItem[]
  >([emptyPrescription()]);

  const [search, setSearch] = useState("");
  const [billDateFilter, setBillDateFilter] = useState<"today" | "yesterday" | "all">("today");
  const [previewRecord, setPreviewRecord] = useState<DentalRecord | null>(null);
  const [message, setMessage] = useState("");

  const [printRecord, setPrintRecord] = useState<DentalRecord | null>(
    null
  );
  const [printType, setPrintType] = useState<"bill" | "prescription" | null>(
    null
  );

  useEffect(() => {
    setMounted(true);

    setPaymentDueDate(
      toDateInputValue(addMonths(new Date(), 3))
    );

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
        const parsedRecords = JSON.parse(savedRecords);
        setRecords(
          Array.isArray(parsedRecords)
            ? parsedRecords.map((record: DentalRecord) => ({
                ...record,
                paymentPlanMonths: record.paymentPlanMonths || 0,
                paymentDueDate: record.paymentDueDate || "",
                paymentHistory:
                  record.paymentHistory ||
                  (Number(record.paid || 0) > 0
                    ? [
                        {
                          id: Number(record.id) + 1,
                          amount: Number(record.paid || 0),
                          date: record.date,
                          method: record.paymentMethod || "Cash",
                        },
                      ]
                    : []),
              }))
            : []
        );
      } catch {
        setRecords([]);
      }
    }

    setRecordsLoaded(true);
  }, []);

  useEffect(() => {
    if (!mounted || !recordsLoaded || editingRecordId !== null || currentBillNo) return;
    setCurrentBillNo(getNextBillNo(records));
  }, [mounted, recordsLoaded, editingRecordId, currentBillNo, records]);

  useEffect(() => {
    if (!mounted || !recordsLoaded || view !== "new-bill") return;

    const editId = Number(localStorage.getItem("parbatDentalEditRecordId") || 0);
    if (!editId) return;

    const record = records.find((r) => r.id === editId);
    if (record) {
      localStorage.removeItem("parbatDentalEditRecordId");
      loadRecord(record);
    }
  }, [mounted, recordsLoaded, view, records]);

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

  const calculatedTotal = Math.max(
    subtotal - Number(discount || 0),
    0
  );

  // The clinic can either use the calculated total from items
  // or type a fixed Total Payable amount (e.g. Rs. 30,000 / 45,000).
  const total = Math.max(
    manualTotal !== null ? Number(manualTotal || 0) : calculatedTotal,
    0
  );

  // `paid` means total paid before today's transaction.
  // `todayPayment` is the amount being collected right now.
  const due = Math.max(
    total - Number(paid || 0) - Number(todayPayment || 0),
    0
  );

  const paidAfterToday = Math.min(
    total,
    Number(paid || 0) + Number(todayPayment || 0)
  );

  const todayDateLabel = new Date().toLocaleDateString();

  const todayCollection = records.reduce((sum, record) => {
    const history = Array.isArray(record.paymentHistory) ? record.paymentHistory : [];
    return sum + history.reduce((inner, payment) => {
      return String(payment.date || "").startsWith(todayDateLabel)
        ? inner + Number(payment.amount || 0)
        : inner;
    }, 0);
  }, 0);

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

  function getNextBillNo(savedRecords: DentalRecord[] = records) {
    const storedCounter = Number(localStorage.getItem("parbatDentalBillCounter") || 0);
    const highestExisting = savedRecords.reduce((max, record) => {
      const match = String(record.billNo || "").match(/PD-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    const next = Math.max(storedCounter, highestExisting) + 1;
    return `PD-${String(next).padStart(4, "0")}`;
  }

  function commitBillCounter(billNo: string) {
    const match = String(billNo || "").match(/PD-(\d+)$/);
    const number = match ? Number(match[1]) : 0;
    const current = Number(localStorage.getItem("parbatDentalBillCounter") || 0);
    if (number > current) {
      localStorage.setItem("parbatDentalBillCounter", String(number));
    }
  }

  function getRecordDateKey(value: string) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
  }

  function getDayOffsetKey(offset: number) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString();
  }

  function createCurrentRecord(options?: { includeTodayPayment?: boolean }): DentalRecord {
    const now = new Date();
    const billNo = currentBillNo || getNextBillNo();
    const payment = options?.includeTodayPayment === false ? 0 : Number(todayPayment || 0);
    const previousPaid = Number(paid || 0);
    const finalPaid = Math.min(total, previousPaid + payment);
    const finalDue = Math.max(total - finalPaid, 0);

    const baseHistory = editingRecordId !== null
      ? records.find((r) => r.id === editingRecordId)?.paymentHistory || []
      : [];

    const history = [...baseHistory];
    if (payment > 0) {
      history.push({
        id: Date.now() + Math.random(),
        amount: payment,
        date: now.toLocaleString(),
        method: paymentMethod,
      });
    }

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
      treatmentItems: treatmentItems.filter((item) => item.name.trim() !== ""),
      medicineItems: medicineItems.filter((item) => item.name.trim() !== ""),

      discount: Number(discount || 0),
      paid: finalPaid,
      paymentMethod,

      prescription: prescription.filter((item) => item.medicine.trim() !== ""),

      subtotal,
      total,
      due: finalDue,

      paymentPlanMonths: Number(paymentPlanMonths || 0),
      paymentDueDate:
        paymentDueDate ||
        toDateInputValue(addMonths(now, Number(paymentPlanMonths || 0))),
      paymentHistory: history,
      todayPayment: payment,
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

    const payment = Number(todayPayment || 0);
    if (payment < 0) {
      setMessage(language === "ne" ? "Payment रकम गलत छ।" : "Invalid payment amount.");
      return null;
    }

    const currentPaid = Number(paid || 0);

    if (editingRecordId !== null && total < currentPaid) {
      setMessage(
        language === "ne"
          ? `Total Payable ${money(currentPaid)} भन्दा कम राख्न मिल्दैन, किनकि यति रकम पहिले नै तिरिसकिएको छ।`
          : `Total Payable cannot be less than the ${money(currentPaid)} already paid.`
      );
      return null;
    }

    const remainingBeforeToday = Math.max(total - currentPaid, 0);
    if (payment > remainingBeforeToday) {
      setMessage(
        language === "ne"
          ? `बाँकी रकम ${money(remainingBeforeToday)} मात्र छ।`
          : `Only ${money(remainingBeforeToday)} is remaining.`
      );
      return null;
    }

    const record = createCurrentRecord();

    if (editingRecordId !== null) {
      const existing = records.find((r) => r.id === editingRecordId);
      if (!existing) return null;

      const updated = {
        ...record,
        id: existing.id,
        billNo: existing.billNo,
        paymentHistory: record.paymentHistory,
      };

      setRecords((old) => old.map((r) => (r.id === existing.id ? updated : r)));
      setPaid(updated.paid);
      setTodayPayment(0);
      setPreviewRecord(updated);

      setMessage(
        language === "ne"
          ? `Bill ${updated.billNo} update भयो।`
          : `Bill ${updated.billNo} updated successfully.`
      );

      return updated;
    }

    setRecords((old) => [record, ...old]);
    commitBillCounter(record.billNo);
    setEditingRecordId(record.id);
    setPaid(record.paid);
    setTodayPayment(0);
    setPreviewRecord(record);

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
    setManualTotal(Number(record.total || 0));
    setPaid(record.paid);
    setTodayPayment(0);
    setPaymentMethod(record.paymentMethod);
    setPaymentPlanMonths(record.paymentPlanMonths || 3);
    setPaymentDueDate(
      record.paymentDueDate ||
        toDateInputValue(
          addMonths(new Date(record.date), record.paymentPlanMonths || 3)
        )
    );
    setEditingRecordId(record.id);
    setCurrentBillNo(record.billNo);

    setPrescription(
      record.prescription.length
        ? record.prescription
        : [emptyPrescription()]
    );

    localStorage.setItem("parbatDentalEditRecordId", String(record.id));
    router.push("/new-bill");

    setMessage(
      language === "ne"
        ? `${record.patientName} को record खोलियो।`
        : `${record.patientName}'s record loaded.`
    );
  }

  function newBill() {
    // Immediately reset the whole billing form for a completely new patient.
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
    setManualTotal(null);
    setPaid(0);
    setTodayPayment(0);
    setPaymentMethod("Cash");
    setPaymentPlanMonths(3);
    setPaymentDueDate(
      toDateInputValue(addMonths(new Date(), 3))
    );

    setPrescription([emptyPrescription()]);
    setEditingRecordId(null);
    setPrintRecord(null);
    setPrintType(null);
    setPreviewRecord(null);
    setMessage("");

    // Generate the new bill number now, so the new bill is visible immediately.
    setCurrentBillNo(getNextBillNo());

    setPatientInfoOpen(false);
    router.push("/new-bill");
  }

  function addPaymentToRecord(recordId: number, amount: number, method: string) {
    const payment = Number(amount || 0);

    if (payment <= 0) {
      setMessage(
        language === "ne"
          ? "भुक्तानी रकम 0 भन्दा ठूलो हुनुपर्छ।"
          : "Payment amount must be greater than 0."
      );
      return;
    }

    setRecords((old) =>
      old.map((record) => {
        if (record.id !== recordId) return record;

        const currentPaid = Number(record.paid || 0);
        const remaining = Math.max(Number(record.total || 0) - currentPaid, 0);

        if (payment > remaining) {
          setMessage(
            language === "ne"
              ? `बाँकी रकम ${money(remaining)} मात्र छ।`
              : `Only ${money(remaining)} is remaining.`
          );
          return record;
        }

        const newPaid = currentPaid + payment;
        const newDue = Math.max(Number(record.total || 0) - newPaid, 0);

        const entry: PaymentEntry = {
          id: Date.now() + Math.random(),
          amount: payment,
          date: new Date().toLocaleString(),
          method,
        };

        return {
          ...record,
          paid: newPaid,
          due: newDue,
          paymentMethod: method,
          paymentHistory: [...(record.paymentHistory || []), entry],
          todayPayment: payment,
        };
      })
    );

    setMessage(
      language === "ne"
        ? `${money(payment)} भुक्तानी record मा थपियो।`
        : `${money(payment)} payment added to the record.`
    );
  }

  function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + Number(months || 0));
    return d;
  }

  function toDateInputValue(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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
                onClick={() => router.push("/bill-preview")}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold"
              >
                👁️ {language === "ne" ? "Bill Preview" : "Bill Preview"}
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
          {view === "dashboard" && (
            <>
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
              value={0}
              icon="📋"
            />

            <StatCard
              title={
                language === "ne"
                  ? "कुल Billing"
                  : "Total Billing"
              }
              value={money(0)}
              icon="💰"
            />

            <StatCard
              title={
                language === "ne"
                  ? "आजको जम्मा भुक्तानी"
                  : "Today's Collection"
              }
              value={money(todayCollection)}
              icon="💵"
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
{/* DASHBOARD HOME PHOTO */}
<div className="mt-6 bg-white rounded-2xl shadow p-4">
  <img
    src="/pokhara.jpg"
    alt="Pokhara"
    className="w-full h-150 object-cover rounded-xl"
  />
</div>
            </>
          )}
          {view === "preview" && (
            <>
          {/* DASHBOARD PHOTO */}
<div className="mt-6 bg-white rounded-2xl shadow p-4">
  <img
    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa"
    alt="Pokhara"
    className="w-full h-80 object-cover rounded-xl"
  />
</div>
          {/* BILL PREVIEW DASHBOARD */}
          <section id="bill-preview-dashboard" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧾</span>
                  <h2 className="text-xl font-black">{language === "ne" ? "Bill Preview / Bill Store" : "Bill Preview / Bill Store"}</h2>
                </div>
                <p className="text-sm text-slate-500 mt-1">{language === "ne" ? "आज, हिजो र पुराना सबै Bill यहाँबाट हेर्न, edit गर्न र print गर्न सकिन्छ।" : "View, edit and print today's, yesterday's and older bills from here."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([['today', language === "ne" ? 'आज' : 'Today'], ['yesterday', language === "ne" ? 'हिजो' : 'Yesterday'], ['all', language === "ne" ? 'सबै Bill' : 'All Bills']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBillDateFilter(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${billDateFilter === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "ne" ? "Client नाम, फोन वा Bill No. खोज्नुहोस्..." : "Search client name, phone or bill no..."}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 mb-4"
            />

            <div className="space-y-3 max-h-[650px] overflow-y-auto">
              {records
                .filter((record) => {
                  const q = search.trim().toLowerCase();
                  const matchesSearch = !q || [record.patientName, record.phone, record.billNo, record.doctor, record.address].some((v) => String(v || '').toLowerCase().includes(q));
                  const todayKey = getDayOffsetKey(0);
                  const yesterdayKey = getDayOffsetKey(-1);
                  const recordKey = getRecordDateKey(record.date);
                  const matchesDate = billDateFilter === 'all' || (billDateFilter === 'today' ? recordKey === todayKey : recordKey === yesterdayKey);
                  return matchesSearch && matchesDate;
                })
                .map((record) => (
                  <div key={`preview-${record.id}`} className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 transition">
                    <div className="grid md:grid-cols-[1fr_auto] gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-lg">{record.patientName}</h3>
                          <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">{record.billNo}</span>
                          {record.due <= 0 ? <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">Paid</span> : <span className="px-2 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold">Due {money(record.due)}</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{record.date} • {record.phone || '-'} • {record.doctor || '-'}</div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-xs">
                          <MiniInfo label="Total" value={money(record.total)} />
                          <MiniInfo label="Paid" value={money(record.paid)} />
                          <MiniInfo label="Due" value={money(record.due)} />
                          <MiniInfo label="Plan" value={`${record.paymentPlanMonths || 0} mo.`} />
                          <MiniInfo label="Final Date" value={record.paymentDueDate ? formatDateOnly(record.paymentDueDate) : '-'} />
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2 md:min-w-[120px]">
                        <button type="button" onClick={() => setPreviewRecord(record)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">👁 Preview</button>
                        <button type="button" onClick={() => loadRecord(record)} className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold">✏️ Edit</button>
                        <button type="button" onClick={() => { setPrintRecord(record); setPrintType('bill'); }} className="flex-1 px-3 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm font-bold">🖨 Print</button>
                      </div>
                    </div>
                  </div>
                ))}
              {records.filter((record) => {
                const q = search.trim().toLowerCase();
                const matchesSearch = !q || [record.patientName, record.phone, record.billNo, record.doctor, record.address].some((v) => String(v || '').toLowerCase().includes(q));
                const recordKey = getRecordDateKey(record.date);
                const matchesDate = billDateFilter === 'all' || (billDateFilter === 'today' ? recordKey === getDayOffsetKey(0) : recordKey === getDayOffsetKey(-1));
                return matchesSearch && matchesDate;
              }).length === 0 && (
                <div className="text-center py-10 text-slate-400">{language === "ne" ? "यो filter मा कुनै Bill छैन।" : "No bills found for this filter."}</div>
              )}
            </div>
          </section>
            </>
          )}
          {view === "new-bill" && (
            <>
          {/* BILLING AREA */}
          <div id="billing-top" className="grid lg:grid-cols-3 gap-6">
            {/* LEFT / MAIN FORM */}
            <div className="lg:col-span-2 space-y-6">
              {/* PATIENT */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <button
                  type="button"
                  onClick={() => setPatientInfoOpen((open) => !open)}
                  className="w-full flex items-center justify-between text-left mb-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👤</div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {language === "ne" ? "बिरामीको जानकारी" : "Patient Information"}
                    </h2>
                  </div>
                  <span className="text-slate-500 text-lg">{patientInfoOpen ? "▲" : "▼"}</span>
                </button>

                {patientInfoOpen && (
                <div className="mt-5">
                <div className="mb-5 rounded-2xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        {language === "ne" ? "Client Payment Overview" : "Client Payment Overview"}
                      </div>
                      <div className="text-xl font-black text-slate-900 truncate">
                        {patientName || (language === "ne" ? "क्लाइन्टको नाम" : "Client Name")}
                      </div>
                      <div className="text-sm text-slate-500">{currentBillNo || "PD-0001"}</div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 flex-1 lg:max-w-4xl">
                      <OverviewBox label={language === "ne" ? "कुल" : "Total"} value={money(total)} tone="blue" />
                      <OverviewBox label={language === "ne" ? "पहिले तिरेको" : "Paid"} value={money(paid)} tone="green" />
                      <OverviewBox label={language === "ne" ? "आज तिर्ने" : "Today"} value={money(todayPayment)} tone="emerald" />
                      <OverviewBox label={language === "ne" ? "बाँकी" : "Due"} value={money(due)} tone="red" />
                      <OverviewBox label={language === "ne" ? "अन्तिम मिति" : "Final Date"} value={paymentDueDate ? formatDateOnly(paymentDueDate) : "-"} tone="orange" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{language === "ne" ? "कुल सम्झौता रकम" : "Total Deal Amount"}</label>
                      <input
                        type="number"
                        min="0"
                        value={manualTotal !== null ? manualTotal : calculatedTotal}
                        onChange={(e) => setManualTotal(Number(e.target.value || 0))}
                        className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 font-bold bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{language === "ne" ? "किस्त अवधि (महिना)" : "Payment Plan (Months)"}</label>
                      <input
                        type="number"
                        min="0"
                        value={paymentPlanMonths}
                        onChange={(e) => {
                          const months = Number(e.target.value || 0);
                          setPaymentPlanMonths(months);
                          setPaymentDueDate(months > 0 ? toDateInputValue(addMonths(new Date(), months)) : "");
                        }}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{language === "ne" ? "आजको भुक्तानी" : "Today's Payment"}</label>
                      <input
                        type="number"
                        min="0"
                        max={Math.max(total - paid, 0)}
                        value={todayPayment}
                        onChange={(e) => {
                          const value = Number(e.target.value || 0);
                          const remaining = Math.max(total - paid, 0);
                          setTodayPayment(Math.min(Math.max(value, 0), remaining));
                        }}
                        className="w-full border-2 border-emerald-300 rounded-xl px-3 py-2 font-bold bg-white text-slate-900"
                      />
                      <div className="text-[11px] text-slate-500 mt-1">{language === "ne" ? `बाँकी ${money(Math.max(total - paid, 0))} मध्ये जति तिरे पनि राख्न मिल्छ।` : `You can enter any amount up to ${money(Math.max(total - paid, 0))}.`}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{language === "ne" ? "अन्तिम भुक्तानी मिति" : "Final Payment Date"}</label>
                      <input
                        type="date"
                        value={paymentDueDate}
                        onChange={(e) => setPaymentDueDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      {language === "ne" ? "बिल नम्बर" : "Bill Number"}
                    </div>
                    <input
                      type="text"
                      value={currentBillNo}
                      onChange={(e) => setCurrentBillNo(e.target.value.toUpperCase())}
                      placeholder="PD-0001"
                      className="w-full max-w-xs border-2 border-blue-300 rounded-xl px-4 py-2 text-xl font-black text-blue-900 bg-white tracking-wider outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-blue-700">
                    {editingRecordId !== null
                      ? language === "ne"
                        ? "पुरानो Bill edit हुँदैछ"
                        : "Editing existing bill"
                      : language === "ne"
                        ? "नयाँ Bill तयार छ"
                        : "New bill ready"}
                  </div>
                </div>

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
                </div>
                )}
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
                    <div className="mb-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {language === "ne" ? "कुल तिर्नुपर्ने रकम" : "Total Payable"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={manualTotal !== null ? manualTotal : calculatedTotal}
                        onChange={(e) => setManualTotal(Number(e.target.value || 0))}
                        className="w-full border-2 border-blue-300 rounded-xl px-3 py-3 bg-white text-slate-900 text-lg font-bold"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {language === "ne"
                          ? "सेवा/औषधिको हिसाबभन्दा फरक कुल रकम भए यहाँ सिधै टाइप गर्नुहोस्।"
                          : "Type the final treatment/package amount directly here."}
                      </p>
                    </div>
                    <SummaryRow
                      label={language === "ne" ? "TOTAL" : "TOTAL"}
                      value={total}
                      big
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {language === "ne" ? "अहिलेसम्म तिरेको" : "Paid So Far"}
                      </label>
                      <div className="w-full border border-slate-200 rounded-xl px-3 py-3 bg-slate-100 text-slate-900 font-bold">
                        {money(paid)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {language === "ne" ? "आजको भुक्तानी" : "Today's Payment"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={Math.max(total - paid, 0)}
                        value={todayPayment}
                        onChange={(e) => setTodayPayment(Number(e.target.value || 0))}
                        className="w-full border-2 border-emerald-300 rounded-xl px-3 py-3 bg-white text-slate-900 font-bold"
                      />
                    </div>
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

                  <div className="border-t pt-4">
                    <div className="font-bold text-slate-800 mb-3">
                      {language === "ne"
                        ? "किस्त / Payment Plan"
                        : "Installment / Payment Plan"}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          {language === "ne" ? "अवधि (महिना)" : "Period (Months)"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={paymentPlanMonths}
                          onChange={(e) => {
                            const months = Number(e.target.value || 0);
                            setPaymentPlanMonths(months);
                            setPaymentDueDate(
                              months > 0
                                ? toDateInputValue(addMonths(new Date(), months))
                                : ""
                            );
                          }}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          {language === "ne" ? "अन्तिम भुक्तानी मिति" : "Payment Due Date"}
                        </label>
                        <input
                          type="date"
                          value={paymentDueDate}
                          onChange={(e) => setPaymentDueDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
                      {language === "ne"
                        ? `कुल ${money(total)}। अहिलेसम्म ${money(paid)}। आज ${money(todayPayment)}। बाँकी ${money(due)}।`
                        : `Total ${money(total)}. Paid so far ${money(paid)}. Today ${money(todayPayment)}. Remaining due ${money(due)}.`}
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-emerald-700">
                        {language === "ne" ? "आजपछि जम्मा तिरेको" : "Paid After Today"}
                      </span>
                      <span className="font-bold text-emerald-700">
                        {money(paidAfterToday)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-red-700">
                        {language === "ne" ? "बाँकी Due" : "Due"}
                      </span>

                      <span className="font-bold text-red-700 text-lg">
                        {money(due)}
                      </span>
                    </div>

                    {paymentDueDate && due > 0 && (
                      <div className="text-xs text-red-600 mt-2">
                        {language === "ne"
                          ? `तिर्नुपर्ने अन्तिम मिति: ${formatDateOnly(paymentDueDate)}`
                          : `Final payment date: ${formatDateOnly(paymentDueDate)}`}
                      </div>
                    )}
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

            </div>
          </div>
            </>
          )}

          {message && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
              {message}
            </div>
          )}
        </div>
      </main>

      {previewRecord && (
        <div className="fixed inset-0 z-[70] bg-black/60 p-4 flex items-center justify-center" onClick={() => setPreviewRecord(null)}>
          <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-lg">🧾 Bill Preview</h2>
                <p className="text-xs text-slate-500">{previewRecord.patientName} • {previewRecord.billNo}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setPrintRecord(previewRecord); setPrintType('bill'); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">🖨 Print</button>
                <button type="button" onClick={() => { loadRecord(previewRecord); setPreviewRecord(null); }} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-bold">✏️ Edit</button>
                <button type="button" onClick={() => setPreviewRecord(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">✕</button>
              </div>
            </div>
            <div className="p-5">
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-black">{settings.clinicName}</h1>
                <p className="text-sm text-slate-500">{settings.address} • {settings.phone}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 py-4 text-sm">
                <div><b>Client:</b> {previewRecord.patientName}<br/><b>Phone:</b> {previewRecord.phone || '-'}<br/><b>Address:</b> {previewRecord.address || '-'}</div>
                <div className="md:text-right"><b>Bill No:</b> {previewRecord.billNo}<br/><b>Date:</b> {previewRecord.date}<br/><b>Doctor:</b> {previewRecord.doctor || '-'}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead><tr><th className="border p-2 text-left">Description</th><th className="border p-2">Qty</th><th className="border p-2 text-right">Amount</th></tr></thead>
                  <tbody>
                    {previewRecord.checkupFee > 0 && <tr><td className="border p-2">Checkup</td><td className="border p-2 text-center">1</td><td className="border p-2 text-right">{money(previewRecord.checkupFee)}</td></tr>}
                    {previewRecord.treatmentItems.map((item) => <tr key={`p-t-${item.id}`}><td className="border p-2">{item.name}</td><td className="border p-2 text-center">{item.qty}</td><td className="border p-2 text-right">{money(item.qty * item.price)}</td></tr>)}
                    {previewRecord.medicineItems.map((item) => <tr key={`p-m-${item.id}`}><td className="border p-2">{item.name}</td><td className="border p-2 text-center">{item.qty}</td><td className="border p-2 text-right">{money(item.qty * item.price)}</td></tr>)}
                  </tbody>
                </table>
              </div>
              <div className="ml-auto max-w-sm mt-4 space-y-2 text-sm">
                <SummaryRow label="Subtotal" value={previewRecord.subtotal} />
                <SummaryRow label="Discount" value={previewRecord.discount} />
                <SummaryRow label="Total" value={previewRecord.total} bold />
                <SummaryRow label="Total Paid" value={previewRecord.paid} bold />
                <SummaryRow label="Due" value={previewRecord.due} bold />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <MiniInfo label="Plan" value={`${previewRecord.paymentPlanMonths || 0} months`} />
                <MiniInfo label="Final Date" value={previewRecord.paymentDueDate ? formatDateOnly(previewRecord.paymentDueDate) : '-'} />
                <MiniInfo label="Payment Method" value={previewRecord.paymentMethod || '-'} />
                <MiniInfo label="Status" value={previewRecord.due > 0 ? 'Due' : 'Paid'} />
              </div>
              {previewRecord.paymentHistory?.length > 0 && (
                <div className="mt-5 border-t pt-4">
                  <h3 className="font-bold mb-2">Payment History</h3>
                  <div className="space-y-1 text-sm">
                    {previewRecord.paymentHistory.map((p) => <div key={p.id} className="flex justify-between"><span>{p.date} • {p.method}</span><b>{money(p.amount)}</b></div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

          body > div {
            background: white !important;
          }

          main,
          header,
          #billing-top,
          #bill-preview-dashboard {
            display: none !important;
          }

          #print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          #print-area,
          #print-area * {
            visibility: visible !important;
          }

          @page {
            size: 80mm auto;
            margin: 0;
          }

          .thermal-receipt {
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 3mm !important;
            margin: 0 !important;
            font-size: 10px !important;
            box-shadow: none !important;
          }

          .thermal-receipt h1 {
            font-size: 18px !important;
          }

          .thermal-receipt table {
            font-size: 10px !important;
          }

          .thermal-receipt th,
          .thermal-receipt td {
            padding: 3px !important;
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

function OverviewBox({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "emerald" | "red" | "orange" }) {
  const toneClass = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-green-50 border-green-100 text-green-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    red: "bg-red-50 border-red-100 text-red-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
  }[tone];
  return (
    <div className={`rounded-xl border p-2 ${toneClass}`}>
      <div className="text-[10px] font-semibold opacity-80">{label}</div>
      <div className="text-sm font-black mt-1 break-words">{value}</div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="font-bold text-slate-700 mt-1">{value}</div>
    </div>
  );
}

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
    <div className="thermal-receipt bg-white text-black">
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
            label="Paid So Far"
            value={Math.max(Number(record.paid || 0) - Number(record.todayPayment || 0), 0)}
          />

          <SummaryPrint
            label="Today's Payment"
            value={Number(record.todayPayment || 0)}
            bold
          />

          <SummaryPrint
            label="Total Paid"
            value={record.paid}
          />

          <SummaryPrint
            label="Due"
            value={record.due}
            bold
          />

          {record.paymentDueDate && record.due > 0 && (
            <div className="mt-2 text-xs border-t pt-2">
              <div className="flex justify-between">
                <span>Payment Plan</span>
                <span>
                  {record.paymentPlanMonths || 0} month(s)
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Final Due Date</span>
                <span>{formatDateOnly(record.paymentDueDate)}</span>
              </div>
            </div>
          )}

          {record.paymentHistory?.length > 0 && (
            <div className="mt-3 text-xs border-t pt-2">
              <div className="font-bold mb-1">Payment History</div>
              {record.paymentHistory.map((payment) => (
                <div key={payment.id} className="flex justify-between gap-2">
                  <span>{payment.date} ({payment.method})</span>
                  <span>{money(payment.amount)}</span>
                </div>
              ))}
            </div>
          )}
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
    <div className="thermal-receipt bg-white text-black">
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

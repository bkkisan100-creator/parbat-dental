"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  phone: string;
  created_at?: string;
};

type PatientForm = {
  name: string;
  age: string;
  gender: string;
  address: string;
  phone: string;
};

const emptyForm: PatientForm = {
  name: "",
  age: "",
  gender: "",
  address: "",
  phone: "",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [form, setForm] = useState<PatientForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // LOAD PATIENTS
  // ==============================
  const loadPatients = async (keyword = "") => {
    try {
      setLoading(true);
      setError("");

      let url = "/api/patients";

      if (keyword.trim()) {
        url =
          "/api/patients?search=" +
          encodeURIComponent(keyword.trim());
      }

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load patients");
      }

      // ==========================================
      // SAFE API RESPONSE HANDLING
      // API may return:
      // [] 
      // { patients: [] }
      // { data: [] }
      // ==========================================
      let patientList: Patient[] = [];

      if (Array.isArray(data)) {
        patientList = data;
      } else if (Array.isArray(data?.patients)) {
        patientList = data.patients;
      } else if (Array.isArray(data?.data)) {
        patientList = data.data;
      } else if (Array.isArray(data?.results)) {
        patientList = data.results;
      } else {
        patientList = [];
      }

      setPatients(patientList);
    } catch (err) {
      console.error(err);

      setPatients([]);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load patients");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // INITIAL LOAD
  // ==============================
  useEffect(() => {
    loadPatients();
  }, []);

  // ==============================
  // SEARCH
  // ==============================
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ==============================
  // OPEN ADD MODAL
  // ==============================
  const openAddModal = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================
  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);

    setForm({
      name: patient.name ?? "",
      age: String(patient.age ?? ""),
      gender: patient.gender ?? "",
      address: patient.address ?? "",
      phone: patient.phone ?? "",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  // ==============================
  // CLOSE MODAL
  // ==============================
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPatient(null);
    setForm(emptyForm);
    setError("");
  };

  // ==============================
  // HANDLE FORM INPUT
  // ==============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // SAVE PATIENT
  // ==============================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const name = form.name.trim();
    const age = form.age.trim();
    const gender = form.gender.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();

    if (!name) {
      setError("Patient name is required.");
      return;
    }

    if (!age) {
      setError("Age is required.");
      return;
    }

    if (!gender) {
      setError("Gender is required.");
      return;
    }

    if (!address) {
      setError("Address is required.");
      return;
    }

    if (!phone) {
      setError("Phone number is required.");
      return;
    }

    if (Number(age) <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        age: Number(age),
        gender,
        address,
        phone,
      };

      let response: Response;

      if (editingPatient) {
        response = await fetch("/api/patients", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingPatient.id,
            ...payload,
          }),
        });
      } else {
        response = await fetch("/api/patients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (editingPatient
              ? "Failed to update patient"
              : "Failed to add patient")
        );
      }

      setShowModal(false);
      setEditingPatient(null);
      setForm(emptyForm);

      setMessage(
        editingPatient
          ? "Patient updated successfully."
          : "Patient added successfully."
      );

      await loadPatients(search);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // DELETE PATIENT
  // ==============================
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/patients?id=" + encodeURIComponent(String(id)),
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete patient");
      }

      setMessage("Patient deleted successfully.");

      await loadPatients(search);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete patient");
      }
    } finally {
      setDeleting(null);
    }
  };

  // ==============================
  // REFRESH
  // ==============================
  const handleRefresh = () => {
    setSearch("");
    loadPatients("");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Patient Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add, search, edit and manage dental patients.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Patient
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && !showModal && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH + REFRESH */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone or address..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* PATIENT COUNT */}
        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Total Patients:{" "}
            <span className="font-bold text-slate-900">
              {Array.isArray(patients) ? patients.length : 0}
            </span>
          </p>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    ID
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Patient
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Age
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Gender
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold text-slate-600">
                    Address
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      Loading patients...
                    </td>
                  </tr>
                ) : !Array.isArray(patients) || patients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center"
                    >
                      <div className="text-4xl">🦷</div>

                      <p className="mt-2 font-semibold text-slate-700">
                        No patients found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Add your first patient to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        #{patient.id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {patient.name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {patient.age}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {patient.gender}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {patient.phone}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {patient.address}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(patient)
                            }
                            className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(patient.id)
                            }
                            disabled={deleting === patient.id}
                            className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting === patient.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="space-y-4 md:hidden">
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              Loading patients...
            </div>
          ) : !Array.isArray(patients) || patients.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="text-4xl">🦷</div>

              <p className="mt-2 font-semibold text-slate-700">
                No patients found
              </p>
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Patient #{patient.id}
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      {patient.name}
                    </h2>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {patient.gender}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-slate-600">
                      Age:
                    </span>{" "}
                    {patient.age}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-600">
                      Phone:
                    </span>{" "}
                    {patient.phone}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-600">
                      Address:
                    </span>{" "}
                    {patient.address}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(patient)}
                    className="flex-1 rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-200"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(patient.id)}
                    disabled={deleting === patient.id}
                    className="flex-1 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    {deleting === patient.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingPatient
                    ? "Edit Patient"
                    : "Add New Patient"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingPatient
                    ? "Update patient information."
                    : "Enter patient information below."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            {/* MODAL ERROR */}
            {error && (
              <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Patient Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Age *
                  </label>

                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="150"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gender *
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    disabled={saving}
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Address *
                </label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter patient address"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={saving}
                />
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPatient
                    ? "Update Patient"
                    : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
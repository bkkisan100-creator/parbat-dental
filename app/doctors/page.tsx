"use client";

import { useRouter } from "next/navigation";

type Doctor = {
  id: number;
  name: string;
  qualification: string;
  specialization: string;
  experience: string;
  phone: string;
  email: string;
  address: string;
  available: string;
  image: string;
};

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Rajesh Sharma",
    qualification: "BDS, MDS",
    specialization: "General & Cosmetic Dentistry",
    experience: "8 Years Experience",
    phone: "+977 98XXXXXXXX",
    email: "doctor@parbatdental.com",
    address: "Kusma, Parbat, Nepal",
    available: "Sunday - Friday | 10:00 AM - 5:00 PM",
    image: "/doctors/doctor1.jpg",
  },
  {
    id: 2,
    name: "Dr. Sita Gurung",
    qualification: "BDS",
    specialization: "Orthodontics",
    experience: "5 Years Experience",
    phone: "+977 98XXXXXXXX",
    email: "sita@parbatdental.com",
    address: "Kusma, Parbat, Nepal",
    available: "Sunday - Friday | 11:00 AM - 4:00 PM",
    image: "/doctors/doctor2.jpg",
  },
];

export default function DoctorsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-sky-50">
      {/* HEADER */}
      <header className="bg-white border-b border-blue-100 px-6 py-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700">
              🦷 Parbat Dental
            </h1>

            <p className="text-gray-500 mt-1">
              Doctor Management
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Our Doctors
          </h2>

          <p className="text-gray-500 mt-2">
            Meet the professional dental team at Parbat Dental.
          </p>
        </div>

        {/* DOCTOR CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              {/* TOP */}
              <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 pt-6 pb-16">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur">
                      🩺 Dental Specialist
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                    ● Available
                  </span>
                </div>
              </div>

              {/* PROFILE */}
              <div className="px-6 pb-6">
                <div className="-mt-16 flex flex-col sm:flex-row sm:items-end gap-5">
                  {/* PHOTO */}
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex-shrink-0">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* NAME */}
                  <div className="pb-1">
                    <h3 className="text-2xl font-extrabold text-gray-800">
                      {doctor.name}
                    </h3>

                    <p className="text-blue-600 font-semibold mt-1">
                      {doctor.qualification}
                    </p>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-7 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      🦷
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Specialization
                      </p>

                      <p className="font-semibold text-gray-700">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      🎓
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Experience
                      </p>

                      <p className="font-semibold text-gray-700">
                        {doctor.experience}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      📞
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Phone
                      </p>

                      <p className="font-semibold text-gray-700">
                        {doctor.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      ✉️
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Email
                      </p>

                      <p className="font-semibold text-gray-700 break-all">
                        {doctor.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      📍
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Address
                      </p>

                      <p className="font-semibold text-gray-700">
                        {doctor.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AVAILABILITY */}
                <div className="mt-6 rounded-2xl bg-sky-50 border border-sky-100 p-4">
                  <p className="text-xs text-blue-500 font-bold uppercase">
                    Available Time
                  </p>

                  <p className="text-gray-700 font-semibold mt-1">
                    🕐 {doctor.available}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    className="py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    👤 View Profile
                  </button>

                  <button
                    type="button"
                    className="py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                  >
                    📅 Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
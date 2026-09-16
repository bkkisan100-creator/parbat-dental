import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

/* =========================
   GET PATIENTS
   ========================= */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    let patients;

    if (search) {
      const keyword = `%${search}%`;

      patients = db
        .prepare(`
          SELECT
            id,
            name,
            age,
            gender,
            address,
            phone,
            created_at
          FROM patients
          WHERE
            name LIKE ?
            OR phone LIKE ?
            OR address LIKE ?
          ORDER BY id DESC
        `)
        .all(keyword, keyword, keyword);
    } else {
      patients = db
        .prepare(`
          SELECT
            id,
            name,
            age,
            gender,
            address,
            phone,
            created_at
          FROM patients
          ORDER BY id DESC
        `)
        .all();
    }

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Patients load गर्न समस्या भयो।",
      },
      { status: 500 }
    );
  }
}


/* =========================
   ADD PATIENT
   ========================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const age = Number(body.age);
    const gender = String(body.gender || "").trim();
    const address = String(body.address || "").trim();
    const phone = String(body.phone || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient name आवश्यक छ।",
        },
        { status: 400 }
      );
    }

    if (!age || age < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid age राख्नुहोस्।",
        },
        { status: 400 }
      );
    }

    if (!gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Gender select गर्नुहोस्।",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address आवश्यक छ।",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number आवश्यक छ।",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        INSERT INTO patients
        (
          name,
          age,
          gender,
          address,
          phone
        )
        VALUES
        (?, ?, ?, ?, ?)
      `)
      .run(
        name,
        age,
        gender,
        address,
        phone
      );

    const patient = db
      .prepare(`
        SELECT
          id,
          name,
          age,
          gender,
          address,
          phone,
          created_at
        FROM patients
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: "Patient successfully saved.",
      patient,
    });
  } catch (error) {
    console.error("ADD PATIENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Patient save गर्न समस्या भयो।",
      },
      { status: 500 }
    );
  }
}


/* =========================
   UPDATE PATIENT
   ========================= */

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const name = String(body.name || "").trim();
    const age = Number(body.age);
    const gender = String(body.gender || "").trim();
    const address = String(body.address || "").trim();
    const phone = String(body.phone || "").trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID आवश्यक छ।",
        },
        { status: 400 }
      );
    }

    if (!name || !age || !gender || !address || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "सबै विवरण भर्नुहोस्।",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        UPDATE patients
        SET
          name = ?,
          age = ?,
          gender = ?,
          address = ?,
          phone = ?
        WHERE id = ?
      `)
      .run(
        name,
        age,
        gender,
        address,
        phone,
        id
      );

    if (result.changes === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient भेटिएन।",
        },
        { status: 404 }
      );
    }

    const patient = db
      .prepare(`
        SELECT
          id,
          name,
          age,
          gender,
          address,
          phone,
          created_at
        FROM patients
        WHERE id = ?
      `)
      .get(id);

    return NextResponse.json({
      success: true,
      message: "Patient successfully updated.",
      patient,
    });
  } catch (error) {
    console.error("UPDATE PATIENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Patient update गर्न समस्या भयो।",
      },
      { status: 500 }
    );
  }
}


/* =========================
   DELETE PATIENT
   ========================= */

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient ID आवश्यक छ।",
        },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        DELETE FROM patients
        WHERE id = ?
      `)
      .run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient भेटिएन।",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Patient successfully deleted.",
    });
  } catch (error) {
    console.error("DELETE PATIENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Patient delete गर्न समस्या भयो।",
      },
      { status: 500 }
    );
  }
}
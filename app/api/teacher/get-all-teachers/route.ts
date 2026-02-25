import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = "https://admin-crm.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ message: "Token topilmadi" }, { status: 401 });
    }

    const response = await axios.get(`${BACKEND_URL}/teacher/get-all-teachers`, {
      headers: {
        Authorization: token,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Teacher GET xatolik:", error.response?.data || error.message);
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      return NextResponse.json(
        { message: "Token muddati tugagan" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: error.response?.data?.message || "Xatolik yuz berdi" },
      { status: error.response?.status || 500 }
    );
  }
}

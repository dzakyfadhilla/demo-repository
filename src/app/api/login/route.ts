import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  // Mock authentication logic
  if (email === "test@example.com" && password === "password123") {
    return NextResponse.json({ message: "Login successful!" });
  }

  return NextResponse.json(
    { message: "Invalid credentials." },
    { status: 401 }
  );
}

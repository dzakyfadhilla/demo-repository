import { NextResponse } from "next/server";

type ProfileData = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  bio?: string;
};

export async function PUT(request: Request) {
  const { username, fullName, email, phone, birthDate, bio }: ProfileData =
    await request.json();

  const errors: Partial<Record<keyof ProfileData, string>> = {};

  if (!username || username.length < 6) {
    errors.username = "Username must be at least 6 characters.";
  }

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Must be a valid email format.";
  }

  if (!phone || !/^\d{10,15}$/.test(phone)) {
    errors.phone = "Phone must be 10-15 digits.";
  }

  if (birthDate) {
    const date = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      errors.birthDate = "Birth date cannot be in the future.";
    }
  }

  if (bio && bio.length > 160) {
    errors.bio = "Bio must be 160 characters or less.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { message: "Validation failed", errors },
      { status: 400 }
    );
  }

  // In a real application, you would update the user's profile in the database.
  console.log("Updating profile with:", {
    username,
    fullName,
    email,
    phone,
    birthDate,
    bio,
  });

  return NextResponse.json({ success: true });
}

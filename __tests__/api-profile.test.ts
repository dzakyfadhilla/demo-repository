import { PUT } from "@/app/api/profile/route";
import { NextResponse } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      ...data,
      json: () => Promise.resolve(data),
    })),
  },
}));

const getValidProfileData = () => ({
  username: "validuser",
  fullName: "Valid User",
  email: "valid@email.com",
  phone: "1234567890",
});

describe("API /api/profile", () => {
  beforeEach(() => {
    (NextResponse.json as jest.Mock).mockClear();
  });

  it("should return 400 if username is too short", async () => {
    const invalidData = { ...getValidProfileData(), username: "short" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { username: "Username must be at least 6 characters." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if fullName is missing", async () => {
    const invalidData = { ...getValidProfileData(), fullName: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { fullName: "Full name is required." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email format is invalid", async () => {
    const invalidData = { ...getValidProfileData(), email: "invalid-email" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if email is missing", async () => {
    const invalidData = { ...getValidProfileData(), email: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { email: "Must be a valid email format." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone format is invalid (non-numeric)", async () => {
    const invalidData = { ...getValidProfileData(), phone: "abc123def" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone is too short (less than 10 digits)", async () => {
    const invalidData = { ...getValidProfileData(), phone: "123456789" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone is too long (more than 15 digits)", async () => {
    const invalidData = { ...getValidProfileData(), phone: "1234567890123456" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if phone is missing", async () => {
    const invalidData = { ...getValidProfileData(), phone: "" };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { phone: "Phone must be 10-15 digits." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if birthDate is in the future", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const invalidData = { ...getValidProfileData(), birthDate: futureDate.toISOString().split('T')[0] };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { birthDate: "Birth date cannot be in the future." },
      },
      { status: 400 }
    );
  });

  it("should return 400 if bio is too long (more than 160 characters)", async () => {
    const longBio = "a".repeat(161);
    const invalidData = { ...getValidProfileData(), bio: longBio };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: { bio: "Bio must be 160 characters or less." },
      },
      { status: 400 }
    );
  });

  it("should accept valid birthDate", async () => {
    const validData = { ...getValidProfileData(), birthDate: "1990-01-01" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should accept valid bio within 160 characters", async () => {
    const validData = { ...getValidProfileData(), bio: "This is a valid bio." };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should accept empty bio (optional field)", async () => {
    const validData = { ...getValidProfileData(), bio: "" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should handle username with exactly 6 characters (boundary test)", async () => {
    const validData = { ...getValidProfileData(), username: "user12" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should handle phone with exactly 10 digits (boundary test)", async () => {
    const validData = { ...getValidProfileData(), phone: "1234567890" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should handle phone with exactly 15 digits (boundary test)", async () => {
    const validData = { ...getValidProfileData(), phone: "123456789012345" };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should handle bio with exactly 160 characters (boundary test)", async () => {
    const exactBio = "a".repeat(160);
    const validData = { ...getValidProfileData(), bio: exactBio };
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should handle malformed JSON request", async () => {
    const req = {
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as Request;
    
    await expect(PUT(req)).rejects.toThrow("Invalid JSON");
  });

  it("should handle multiple validation errors", async () => {
    const invalidData = {
      username: "short",
      fullName: "",
      email: "invalid-email",
      phone: "123",
      birthDate: "2050-01-01",
      bio: "a".repeat(161)
    };
    const req = {
      json: () => Promise.resolve(invalidData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        message: "Validation failed",
        errors: {
          username: "Username must be at least 6 characters.",
          fullName: "Full name is required.",
          email: "Must be a valid email format.",
          phone: "Phone must be 10-15 digits.",
          birthDate: "Birth date cannot be in the future.",
          bio: "Bio must be 160 characters or less."
        },
      },
      { status: 400 }
    );
  });

  it("should return 200 on valid data", async () => {
    const validData = getValidProfileData();
    const req = {
      json: () => Promise.resolve(validData),
    } as Request;
    await PUT(req);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
    });
  });
});

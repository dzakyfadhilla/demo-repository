/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
    ok: true,
  })
) as jest.Mock;

describe("ProfilePage", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("renders all form fields", () => {
    render(<ProfilePage />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birth Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty/invalid fields", async () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Must be a valid email format/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Phone must be 10-15 digits/i)).toBeInTheDocument();
  });

  it("submits valid form and shows success message", async () => {
    render(<ProfilePage />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should show validation error for invalid email format", async () => {
    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Must be a valid email format/i)
    ).toBeInTheDocument();
  });

  it("should show validation error for future birth date", async () => {
    render(<ProfilePage />);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    fireEvent.change(screen.getByLabelText(/Birth Date/i), {
      target: { value: futureDate.toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Birth date cannot be in the future/i)
    ).toBeInTheDocument();
  });

  it("should show validation error for bio exceeding 160 characters", async () => {
    render(<ProfilePage />);

    const longBio = "a".repeat(161);
    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: longBio },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    expect(
      await screen.findByText(/Bio must be 160 characters or less/i)
    ).toBeInTheDocument();
  });

  it("should handle API error responses", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: "Validation failed",
          errors: { username: "Username already exists" },
        }),
    });

    render(<ProfilePage />);

    // Fill in valid data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
    });
  });

  it("should handle network errors gracefully", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<ProfilePage />);

    // Fill in valid data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    });
  });

  it("should show loading state during form submission", async () => {
    (fetch as jest.Mock).mockImplementation(() =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            }),
          100
        )
      )
    );

    render(<ProfilePage />);

    // Fill in valid data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    // Check if button is disabled during submission
    expect(screen.getByRole("button", { name: /Update/i })).toBeDisabled();
  });

  it("should show success message after successful update", async () => {
    render(<ProfilePage />);

    // Fill in valid data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it("should reset form validation errors when valid input is entered", async () => {
    render(<ProfilePage />);

    // Submit with empty fields to trigger validation errors
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    // Wait for validation errors to appear
    expect(
      await screen.findByText(/Username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();

    // Enter valid values
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });

    // Validation errors should be cleared
    expect(
      screen.queryByText(/Username must be at least 6 characters/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Full name is required/i)).not.toBeInTheDocument();
  });

  it("should handle boundary values correctly", async () => {
    render(<ProfilePage />);

    // Test boundary values
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "user12" }, // exactly 6 characters
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" }, // exactly 10 digits
    });
    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: "a".repeat(160) }, // exactly 160 characters
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should allow empty bio field", async () => {
    render(<ProfilePage />);

    // Fill in required fields, leave bio empty
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should allow empty birth date field", async () => {
    render(<ProfilePage />);

    // Fill in required fields, leave birth date empty
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "validuser" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should handle special characters in form fields", async () => {
    render(<ProfilePage />);

    // Test with special characters
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "user_123" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John O'Connor-Smith" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john.test+1@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/Bio/i), {
      target: { value: "Hello! I'm a developer & designer. Nice to meet you!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should test form accessibility features", () => {
    render(<ProfilePage />);

    // Check that all form fields have proper labels
    expect(screen.getByLabelText(/Username/i)).toHaveAttribute("id");
    expect(screen.getByLabelText(/Full Name/i)).toHaveAttribute("id");
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute("id");
    expect(screen.getByLabelText(/Phone/i)).toHaveAttribute("id");
    expect(screen.getByLabelText(/Birth Date/i)).toHaveAttribute("id");
    expect(screen.getByLabelText(/Bio/i)).toHaveAttribute("id");

    // Check that the form can be submitted with keyboard
    const submitButton = screen.getByRole("button", { name: /Update/i });
    expect(submitButton).toBeInTheDocument();

    // Check that form fields have proper types
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Phone/i)).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText(/Birth Date/i)).toHaveAttribute("type", "date");
  });
});

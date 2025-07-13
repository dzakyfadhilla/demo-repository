/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it("should render the login form with email and password fields", () => {
    render(<LoginPage />);
    
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should render the show/hide password toggle button", () => {
    render(<LoginPage />);
    
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it("should toggle password visibility when toggle button is clicked", () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();
    
    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
  });

  it("should show email validation error when email is empty", async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
  });

  it("should show password validation error when password is less than 6 characters", async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    fireEvent.change(passwordInput, { target: { value: "12345" } });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Password must be at least 6 characters.")).toBeInTheDocument();
  });

  it("should submit form with valid credentials", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Login successful!" }),
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });
  });

  it("should show loading state during form submission", async () => {
    const { toast } = require("react-hot-toast");
    
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Login successful!" }),
      }), 100))
    );

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    expect(toast.loading).toHaveBeenCalledWith("Logging in...");
  });

  it("should show success message on successful login", async () => {
    const { toast } = require("react-hot-toast");
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Login successful!" }),
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Login successful!", { id: "toast-id" });
    });
  });

  it("should show error message on failed login", async () => {
    const { toast } = require("react-hot-toast");
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid credentials." }),
    });

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials.", { id: "toast-id" });
    });
  });

  it("should prevent form submission when validation fails", async () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);
    
    // Should not call fetch when validation fails
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should have proper accessibility attributes", () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });
});

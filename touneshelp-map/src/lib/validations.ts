import { z } from "zod";

// Password strength requirements:
// - At least 8 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 1 number
// - At least 1 special character
const passwordRequirements = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

// Check password strength and return a score (0-4)
export function checkPasswordStrength(password: string): {
  score: number;
  label: "weak" | "fair" | "good" | "strong";
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} {
  const requirements = {
    length: password.length >= passwordRequirements.minLength,
    uppercase: passwordRequirements.hasUppercase.test(password),
    lowercase: passwordRequirements.hasLowercase.test(password),
    number: passwordRequirements.hasNumber.test(password),
    special: passwordRequirements.hasSpecial.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;

  let score: number;
  let label: "weak" | "fair" | "good" | "strong";

  if (metCount <= 2) {
    score = 0;
    label = "weak";
  } else if (metCount === 3) {
    score = 1;
    label = "fair";
  } else if (metCount === 4) {
    score = 2;
    label = "good";
  } else {
    score = 3;
    label = "strong";
  }

  return { score, label, requirements };
}

// Registration form validation schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(
        passwordRequirements.minLength,
        `Password must be at least ${passwordRequirements.minLength} characters`
      )
      .refine(
        (password) => passwordRequirements.hasUppercase.test(password),
        "Password must contain at least 1 uppercase letter"
      )
      .refine(
        (password) => passwordRequirements.hasLowercase.test(password),
        "Password must contain at least 1 lowercase letter"
      )
      .refine(
        (password) => passwordRequirements.hasNumber.test(password),
        "Password must contain at least 1 number"
      )
      .refine(
        (password) => passwordRequirements.hasSpecial.test(password),
        "Password must contain at least 1 special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login form validation schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        passwordRequirements.minLength,
        `Password must be at least ${passwordRequirements.minLength} characters`
      )
      .refine(
        (password) => passwordRequirements.hasUppercase.test(password),
        "Password must contain at least 1 uppercase letter"
      )
      .refine(
        (password) => passwordRequirements.hasLowercase.test(password),
        "Password must contain at least 1 lowercase letter"
      )
      .refine(
        (password) => passwordRequirements.hasNumber.test(password),
        "Password must contain at least 1 number"
      )
      .refine(
        (password) => passwordRequirements.hasSpecial.test(password),
        "Password must contain at least 1 special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

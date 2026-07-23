import { z } from "zod";
import { supabase } from "@/utils/supabase";

const registrationInputSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  companyName: z.string().trim().min(2).max(200),
  password: z.string().min(8).max(72),
});

const signUpResponseSchema = z.object({
  data: z.object({
    user: z
      .object({
        id: z.string().uuid(),
        email: z.string().email().nullable(),
      })
      .nullable(),
    session: z.unknown().nullable(),
  }),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
      status: z.number().optional(),
    })
    .nullable(),
});

export type RegistrationInput = z.infer<typeof registrationInputSchema>;

export type RegistrationResult = {
  requiresEmailConfirmation: boolean;
};

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationError";
  }
}

function emailRedirectUrl() {
  if (typeof window === "undefined") return undefined;

  return new URL("/iniciar-sesion", window.location.origin).toString();
}

export async function registerAccount(input: RegistrationInput): Promise<RegistrationResult> {
  const values = registrationInputSchema.parse(input);
  const companySlug = toCompanySlug(values.companyName);
  const response = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: emailRedirectUrl(),
      // This metadata is only used to initialize product-profile/onboarding UX.
      // Authorization always comes from company_members in PostgreSQL.
      data: {
        full_name: values.fullName,
        onboarding_company_name: values.companyName,
        onboarding_company_slug: companySlug,
      },
    },
  });

  const parsed = signUpResponseSchema.safeParse(response);
  if (!parsed.success) {
    throw new RegistrationError("No fue posible validar la respuesta del registro.");
  }

  if (parsed.data.error) {
    throw new RegistrationError(toRegistrationMessage(parsed.data.error.message));
  }

  if (!parsed.data.data.user) {
    throw new RegistrationError("No fue posible crear la cuenta. Inténtalo nuevamente.");
  }

  return { requiresEmailConfirmation: parsed.data.data.session === null };
}

function toCompanySlug(companyName: string) {
  const slug = companyName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug) {
    throw new RegistrationError("El nombre de la empresa debe incluir letras o números.");
  }

  return slug;
}

function toRegistrationMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("password")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }

  if (normalized.includes("email") || normalized.includes("rate limit")) {
    return "No fue posible completar el registro con este correo. Inténtalo de nuevo más tarde.";
  }

  return "No fue posible crear la cuenta. Inténtalo nuevamente.";
}

import type { Company, User } from "./types";

export const demoCompany: Company = {
  id: "company-1",
  name: "Nébula Labs",
  slug: "nebula-labs",
  description:
    "Diseñamos y construimos productos digitales para empresas que quieren mejorar la experiencia de sus clientes.",
  website: "https://nebulalabs.co",
  contactEmail: "talento@nebulalabs.co",
  primaryColor: "#2563EB",
  secondaryColor: "#0F172A",
};

export const demoUser: User = {
  id: "user-1",
  name: "Sofía Martínez",
  email: "sofia@nebulalabs.co",
  role: "Administradora",
};
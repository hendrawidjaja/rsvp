export const config = {
  app: {
    name: "RSVP App",
    version: "1.0.0",
  },
  database: {
    host: "localhost",
    maxConnections: 5,
    name: "rsvp_db",
    password: "rsvp_password",
    port: 5432,
    url: "postgres://rsvp_user:rsvp_password@localhost:5432/rsvp_db",
    user: "rsvp_user",
  },
  jwt: {
    expirationHours: 24,
    secret: "your-super-secret-jwt-key-change-in-production",
  },
  password: {
    minLength: 8,
  },
  redis: {
    host: "localhost",
    port: 6379,
    url: "redis://localhost:6379",
  },
  rsvp: {
    maxDietaryRestrictionsLength: 500,
    maxGuests: 10,
    maxNameLength: 100,
  },
  server: {
    backend: {
      host: "0.0.0.0",
      port: 8080,
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    },
    frontend: {
      host: "localhost",
      port: 3000,
      url: "http://localhost:3000",
    },
  },
} as const;

export type Config = typeof config;
export default config;
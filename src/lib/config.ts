export const config = {
  app: {
    name: "RSVP App",
    version: "1.0.0",
  },
  server: {
    frontend: {
      port: 3000,
      host: "localhost",
      url: "http://localhost:3000",
    },
    backend: {
      port: 8080,
      host: "0.0.0.0",
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    },
  },
  database: {
    host: "localhost",
    port: 5432,
    name: "rsvp_db",
    user: "rsvp_user",
    password: "rsvp_password",
    url: "postgres://rsvp_user:rsvp_password@localhost:5432/rsvp_db",
    maxConnections: 5,
  },
  redis: {
    host: "localhost",
    port: 6379,
    url: "redis://localhost:6379",
  },
  jwt: {
    secret: "your-super-secret-jwt-key-change-in-production",
    expirationHours: 24,
  },
  password: {
    minLength: 8,
  },
  rsvp: {
    maxGuests: 10,
    maxDietaryRestrictionsLength: 500,
    maxNameLength: 100,
  },
} as const;

export type Config = typeof config;
export default config;

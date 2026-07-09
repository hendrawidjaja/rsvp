import type { Metadata } from "next";
import ClientLayout from "@/components/client-layout/ClientLayout";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "RSVP App",
  description: "Event RSVP Management Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

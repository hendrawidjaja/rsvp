import type { Metadata } from "next";
import ClientLayout from "@/components/client-layout/ClientLayout";
import "@/styles/globals.scss";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description: "Event RSVP",
  title: "RSVP",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
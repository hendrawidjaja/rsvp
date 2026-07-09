"use client";

import { useAuthStore } from "@/stores/authStore";
import AuthPage from "@/components/auth/auth-page/AuthPage";
import RSVPForm from "@/components/rsvp/rsvp-form/RSVPForm";
import RSVPList from "@/components/rsvp/rsvp-list/RSVPList";
import StatsDisplay from "@/components/stats-display/StatsDisplay";

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <StatsDisplay />
      <RSVPForm />
      <RSVPList />
    </>
  );
}

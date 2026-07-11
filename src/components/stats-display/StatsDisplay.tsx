"use client";

import { useRSVPStore } from "@/stores/rsvpStore";
import styles from "./styles.module.scss";

export default function StatsDisplay() {
  const stats = useRSVPStore((state) => state.getStats());

  const statItems = [
    { label: "Total Responses", value: stats.total },
    { label: "Attending", value: stats.attending },
    { label: "Not Attending", value: stats.notAttending },
    { label: "Total Guests", value: stats.totalGuests },
  ];

  return (
    <div className={styles.container}>
      {statItems.map((item) => (
        <div className={styles.card} key={item.label}>
          <h3 className={styles.value}>{item.value}</h3>
          <p className={styles.label}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRSVPStore } from "@/stores/rsvpStore";
import RSVPForm from "@/components/rsvp/rsvp-form/RSVPForm";
import RSVPCard from "@/components/rsvp/rsvp-card/RSVPCard";
import styles from "./rsvp-list.module.scss";

export default function RSVPList() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const rsvps = useRSVPStore((state) => state.rsvps);
  const deleteRSVP = useRSVPStore((state) => state.deleteRSVP);

  const handleEdit = (id: string) => {
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this RSVP?")) {
      deleteRSVP(id);
      if (editingId === id) {
        setEditingId(null);
      }
    }
  };

  if (rsvps.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No RSVPs Yet</h3>
        <p>Be the first to RSVP for our event!</p>
      </div>
    );
  }

  return (
    <div>
      {editingId && (
        <RSVPForm editingId={editingId} onCancel={handleCancelEdit} />
      )}
      <div className={styles.list}>
        {rsvps.map((rsvp) => (
          <RSVPCard
            key={rsvp.id}
            rsvp={rsvp}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

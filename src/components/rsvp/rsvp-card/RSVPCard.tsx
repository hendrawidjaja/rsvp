import type { RSVP } from "@/lib/schemas";
import styles from "./rsvp-card.module.scss";

interface RSVPCardProps {
  rsvp: RSVP;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RSVPCard({ rsvp, onEdit, onDelete }: RSVPCardProps) {
  return (
    <div
      className={`${styles.card} ${!rsvp.attending ? styles.notAttending : ""}`}
    >
      <h3 className={styles.name}>{rsvp.name}</h3>
      <p className={styles.detail}>{rsvp.email}</p>
      <p className={styles.detail}>
        Status:{" "}
        <span className={styles.status}>
          {rsvp.attending ? "Attending" : "Not Attending"}
        </span>
      </p>
      {rsvp.attending && rsvp.guests > 0 && (
        <p className={styles.detail}>Additional Guests: {rsvp.guests}</p>
      )}
      {rsvp.dietaryRestrictions && (
        <p className={styles.detail}>
          Dietary Restrictions: {rsvp.dietaryRestrictions}
        </p>
      )}
      <p className={styles.detail}>
        Responded: {new Date(rsvp.createdAt).toLocaleDateString()}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => onEdit(rsvp.id)}
          className={styles.editBtn}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(rsvp.id)}
          className={styles.deleteBtn}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
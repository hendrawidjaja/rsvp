import Button from "@/atomic/Button/Button";
import type { RSVP } from "@/lib/schemas";
import styles from "./styles.module.scss";

interface RSVPCardProps {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  rsvp: RSVP;
}

export default function RSVPCard({ rsvp, onEdit, onDelete }: RSVPCardProps) {
  return (
    <div className={`${styles.card} ${!rsvp.attending ? styles.notAttending : ""}`}>
      <h3 className={styles.name}>{rsvp.name}</h3>
      <p className={styles.detail}>{rsvp.email}</p>
      <p className={styles.detail}>
        Status: <span className={styles.status}>{rsvp.attending ? "Attending" : "Not Attending"}</span>
      </p>
      {rsvp.attending && rsvp.guests > 0 && <p className={styles.detail}>Additional Guests: {rsvp.guests}</p>}
      {rsvp.dietaryRestrictions && <p className={styles.detail}>Dietary Restrictions: {rsvp.dietaryRestrictions}</p>}
      <p className={styles.detail}>Responded: {new Date(rsvp.createdAt).toLocaleDateString()}</p>
      <div className={styles.actions}>
        <Button ariaLabel="Edit" className={styles.editBtn} onClick={() => onEdit(rsvp.id)} type="button">
          Edit
        </Button>
        <Button ariaLabel="Delete" className={styles.deleteBtn} onClick={() => onDelete(rsvp.id)} type="button">
          Delete
        </Button>
      </div>
    </div>
  );
}

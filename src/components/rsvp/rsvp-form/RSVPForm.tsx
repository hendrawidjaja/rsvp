"use client";

import { useEffect, useState } from "react";
import type { RSVPFormData } from "@/lib/schemas";
import { rsvpFormSchema } from "@/lib/schemas";
import { useRSVPStore } from "@/stores/rsvpStore";
import styles from "./styles.module.scss";

interface RSVPFormProps {
  editingId?: string;
  onCancel?: () => void;
}

const INITIAL_FORM_DATA: RSVPFormData = {
  attending: false,
  dietaryRestrictions: "",
  email: "",
  guests: 0,
  name: "",
};

export default function RSVPForm({ editingId, onCancel }: RSVPFormProps) {
  const addRSVP = useRSVPStore((state) => state.addRSVP);
  const updateRSVP = useRSVPStore((state) => state.updateRSVP);
  const getRSVP = useRSVPStore((state) => state.getRSVP);

  const [formData, setFormData] = useState<RSVPFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingId) {
      const rsvp = getRSVP(editingId);
      if (rsvp) {
        setFormData({
          attending: rsvp.attending,
          dietaryRestrictions: rsvp.dietaryRestrictions || "",
          email: rsvp.email,
          guests: rsvp.guests,
          name: rsvp.name,
        });
      }
    }
  }, [editingId, getRSVP]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = rsvpFormSchema.parse(formData);

      if (editingId) {
        updateRSVP(editingId, validatedData);
      } else {
        addRSVP(validatedData);
      }

      setFormData(INITIAL_FORM_DATA);

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as {
          errors: Array<{ path: string[]; message: string }>;
        };
        const newErrors: Record<string, string> = {};
        zodError.errors.forEach((err) => {
          const field = err.path[0];
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "attending" && !checked ? { guests: 0 } : {}),
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{editingId ? "Edit RSVP" : "Submit RSVP"}</h2>

      <div className={styles.field}>
        <label htmlFor="rsvp-name">Name *</label>
        <input
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
          id="rsvp-name"
          name="name"
          onChange={handleChange}
          placeholder="Enter your full name"
          type="text"
          value={formData.name}
        />
        {errors.name && (
          <span className={styles.fieldError}>{errors.name}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-email">Email *</label>
        <input
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          id="rsvp-email"
          name="email"
          onChange={handleChange}
          placeholder="your.email@example.com"
          type="email"
          value={formData.email}
        />
        {errors.email && (
          <span className={styles.fieldError}>{errors.email}</span>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.checkbox}>
          <input
            checked={formData.attending}
            id="rsvp-attending"
            name="attending"
            onChange={handleChange}
            type="checkbox"
          />
          <label htmlFor="rsvp-attending">I will attend the event</label>
        </div>
      </div>

      {formData.attending && (
        <div className={styles.field}>
          <label htmlFor="rsvp-guests">Number of Additional Guests</label>
          <input
            className={`${styles.input} ${errors.guests ? styles.inputError : ""}`}
            id="rsvp-guests"
            max="10"
            min="0"
            name="guests"
            onChange={handleChange}
            type="number"
            value={formData.guests}
          />
          {errors.guests && (
            <span className={styles.fieldError}>{errors.guests}</span>
          )}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="rsvp-dietary">
          Dietary Restrictions / Special Requests
        </label>
        <textarea
          className={`${styles.textarea} ${errors.dietaryRestrictions ? styles.inputError : ""}`}
          id="rsvp-dietary"
          name="dietaryRestrictions"
          onChange={handleChange}
          placeholder="Let us know about any dietary needs or special requests..."
          value={formData.dietaryRestrictions}
        />
        {errors.dietaryRestrictions && (
          <span className={styles.fieldError}>
            {errors.dietaryRestrictions}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.submitBtn}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Submitting..."
            : editingId
              ? "Update RSVP"
              : "Submit RSVP"}
        </button>
        {editingId && onCancel && (
          <button className={styles.cancelBtn} onClick={onCancel} type="button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
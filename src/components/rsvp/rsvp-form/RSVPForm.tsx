"use client";

import { useState, useEffect } from "react";
import { useRSVPStore } from "@/stores/rsvpStore";
import { rsvpFormSchema } from "@/lib/schemas";
import type { RSVPFormData } from "@/lib/schemas";
import styles from "./rsvp-form.module.scss";

interface RSVPFormProps {
  editingId?: string;
  onCancel?: () => void;
}

export default function RSVPForm({ editingId, onCancel }: RSVPFormProps) {
  const addRSVP = useRSVPStore((state) => state.addRSVP);
  const updateRSVP = useRSVPStore((state) => state.updateRSVP);
  const getRSVP = useRSVPStore((state) => state.getRSVP);

  const [formData, setFormData] = useState<RSVPFormData>({
    name: "",
    email: "",
    attending: false,
    guests: 0,
    dietaryRestrictions: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingId) {
      const rsvp = getRSVP(editingId);
      if (rsvp) {
        setFormData({
          name: rsvp.name,
          email: rsvp.email,
          attending: rsvp.attending,
          guests: rsvp.guests,
          dietaryRestrictions: rsvp.dietaryRestrictions || "",
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

      setFormData({
        name: "",
        email: "",
        attending: false,
        guests: 0,
        dietaryRestrictions: "",
      });

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{editingId ? "Edit RSVP" : "Submit RSVP"}</h2>

      <div className={styles.field}>
        <label htmlFor="rsvp-name">Name *</label>
        <input
          type="text"
          id="rsvp-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
          placeholder="Enter your full name"
        />
        {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="rsvp-email">Email *</label>
        <input
          type="email"
          id="rsvp-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          placeholder="your.email@example.com"
        />
        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <div className={styles.checkbox}>
          <input
            type="checkbox"
            id="rsvp-attending"
            name="attending"
            checked={formData.attending}
            onChange={handleChange}
          />
          <label htmlFor="rsvp-attending">I will attend the event</label>
        </div>
      </div>

      {formData.attending && (
        <div className={styles.field}>
          <label htmlFor="rsvp-guests">Number of Additional Guests</label>
          <input
            type="number"
            id="rsvp-guests"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            className={`${styles.input} ${errors.guests ? styles.inputError : ""}`}
            min="0"
            max="10"
          />
          {errors.guests && <span className={styles.fieldError}>{errors.guests}</span>}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="rsvp-dietary">Dietary Restrictions / Special Requests</label>
        <textarea
          id="rsvp-dietary"
          name="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={handleChange}
          className={`${styles.textarea} ${errors.dietaryRestrictions ? styles.inputError : ""}`}
          placeholder="Let us know about any dietary needs or special requests..."
        />
        {errors.dietaryRestrictions && (
          <span className={styles.fieldError}>{errors.dietaryRestrictions}</span>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : editingId ? "Update RSVP" : "Submit RSVP"}
        </button>
        {editingId && onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

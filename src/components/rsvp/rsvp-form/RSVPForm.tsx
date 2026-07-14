"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Button from "@/atomic/Button/Button";
import Input from "@/atomic/Input/Input";
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const validatedData = rsvpFormSchema.parse(formData);
      if (editingId) updateRSVP(editingId, validatedData);
      else addRSVP(validatedData);
      setFormData(INITIAL_FORM_DATA);
      if (onCancel) onCancel();
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const newErrors: Record<string, string> = {};
        zodError.errors.forEach((err) => { newErrors[err.path[0]] = err.message; });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked, ...(name === "attending" && !checked ? { guests: 0 } : {}) }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{editingId ? "Edit RSVP" : "Submit RSVP"}</h2>

      <Input id="rsvp-name" label="Name *" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Enter your full name" type="text" />
      <Input id="rsvp-email" label="Email *" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="your.email@example.com" type="email" />
      <Input id="rsvp-attending" label="I will attend the event" name="attending" checked={formData.attending} onChange={handleChange} type="checkbox" />

      {formData.attending && (
        <Input id="rsvp-guests" label="Number of Additional Guests" name="guests" value={formData.guests} onChange={handleChange} error={errors.guests} type="number" min="0" max="10" />
      )}

      <div className={styles.field}>
        <label htmlFor="rsvp-dietary">Dietary Restrictions / Special Requests</label>
        <textarea id="rsvp-dietary" name="dietaryRestrictions" className={styles.textarea} value={formData.dietaryRestrictions} onChange={handleChange} placeholder="Let us know..." />
        {errors.dietaryRestrictions && <span className={styles.fieldError}>{errors.dietaryRestrictions}</span>}
      </div>

      <div className={styles.actions}>
        <Button ariaLabel="Submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : editingId ? "Update RSVP" : "Submit RSVP"}
        </Button>
        {editingId && onCancel && (
          <Button ariaLabel="Cancel" className={styles.cancelBtn} onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

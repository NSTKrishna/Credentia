import { z } from 'zod';

export const createCandidateSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email format' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, { message: 'Aadhaar number must be exactly 12 digits' }),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN number format' }),
  dob: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "That's not a valid date!",
  }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters' }),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const candidateIdSchema = z.object({
  id: z.string().uuid({ message: 'Invalid candidate ID format' }),
});

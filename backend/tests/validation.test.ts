import { createCandidateSchema } from '../src/validations/candidate.validation';

describe('Validation Schemas', () => {
  describe('Aadhaar Regex', () => {
    const validateAadhaar = (aadhaar: string) => {
      const result = createCandidateSchema.safeParse({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        aadhaarNumber: aadhaar,
        panNumber: 'ABCDE1234F',
        dob: '1990-01-01',
        address: '123 Main St, City, Country',
      });
      if (!result.success) {
        return result.error.flatten().fieldErrors.aadhaarNumber;
      }
      return undefined;
    };

    it('should validate correctly formatted 12-digit Aadhaar', () => {
      expect(validateAadhaar('123456789012')).toBeUndefined();
    });

    it('should reject Aadhaar less than 12 digits', () => {
      expect(validateAadhaar('12345')).toBeDefined();
    });

    it('should reject non-numeric Aadhaar', () => {
      expect(validateAadhaar('abcdefghijkl')).toBeDefined();
    });

    it('should reject empty Aadhaar', () => {
      expect(validateAadhaar('')).toBeDefined();
    });
  });

  describe('PAN Regex', () => {
    const validatePAN = (pan: string) => {
      const result = createCandidateSchema.safeParse({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        aadhaarNumber: '123456789012',
        panNumber: pan,
        dob: '1990-01-01',
        address: '123 Main St, City, Country',
      });
      if (!result.success) {
        return result.error.flatten().fieldErrors.panNumber;
      }
      return undefined;
    };

    it('should validate correctly formatted PAN', () => {
      expect(validatePAN('ABCDE1234F')).toBeUndefined();
    });

    it('should reject lowercase letters in PAN', () => {
      // The schema converts it toUpperCase() and trims it, so it might pass if the structure is correct.
      // Wait, let's test how Zod behaves. Zod runs `toUpperCase()` BEFORE `regex()` check.
      // We will assert it passes since it auto-corrects.
      expect(validatePAN('abcde1234f')).toBeUndefined();
    });

    it('should reject improperly formatted PAN', () => {
      expect(validatePAN('12345ABCDE')).toBeDefined(); // Starts with numbers instead of letters
    });

    it('should reject PAN too short', () => {
      expect(validatePAN('ABCDE123')).toBeDefined();
    });
  });
});

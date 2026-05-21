'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { candidateService } from '@/services/candidate.service';

const candidateSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone must be exactly 10 digits' }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, { message: 'Aadhaar must be exactly 12 digits' }),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format' }),
  dob: z.string().min(1, { message: 'Date of birth is required' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters' }),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

interface CandidateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  candidateToEdit?: any; // If editing
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  candidateToEdit,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: candidateToEdit || {
      fullName: '',
      email: '',
      phone: '',
      aadhaarNumber: '',
      panNumber: '',
      dob: '',
      address: '',
    },
  });

  // Handle Aadhaar formatting (display as XXXX-XXXX-XXXX but store as XXXXXXXXXXXX)
  const [displayAadhaar, setDisplayAadhaar] = useState(
    candidateToEdit?.aadhaarNumber ? candidateToEdit.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1-') : ''
  );

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 12);
    // Format for display
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1-');
    setDisplayAadhaar(formatted);
    // Set actual value for form
    setValue('aadhaarNumber', val, { shouldValidate: true });
  };

  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 10);
    e.target.value = val; // Force uppercase in UI
    setValue('panNumber', val, { shouldValidate: true });
  };

  const onSubmit = async (data: CandidateFormValues) => {
    setApiError(null);
    try {
      if (candidateToEdit) {
        await candidateService.updateCandidate(candidateToEdit.id, data);
      } else {
        await candidateService.createCandidate(data);
      }
      reset();
      onSuccess();
    } catch (error: any) {
      setApiError(error.response?.data?.error || 'Failed to save candidate');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {candidateToEdit ? 'Edit Candidate' : 'Add New Candidate'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {apiError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.fullName ? 'border-red-300' : 'border-slate-300'}`}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.email ? 'border-red-300' : 'border-slate-300'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.phone ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="10 digits"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  max={today}
                  {...register('dob')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.dob ? 'border-red-300' : 'border-slate-300'}`}
                />
                {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob.message}</p>}
              </div>

              {/* Aadhaar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  value={displayAadhaar}
                  onChange={handleAadhaarChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.aadhaarNumber ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="XXXX-XXXX-XXXX"
                />
                {/* Hidden input to register value in hook form */}
                <input type="hidden" {...register('aadhaarNumber')} />
                {errors.aadhaarNumber && <p className="mt-1 text-xs text-red-500">{errors.aadhaarNumber.message}</p>}
              </div>

              {/* PAN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  {...register('panNumber')}
                  onChange={handlePANChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase ${errors.panNumber ? 'border-red-300' : 'border-slate-300'}`}
                  placeholder="ABCDE1234F"
                />
                {errors.panNumber && <p className="mt-1 text-xs text-red-500">{errors.panNumber.message}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <textarea
                rows={3}
                {...register('address')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${errors.address ? 'border-red-300' : 'border-slate-300'}`}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {candidateToEdit ? 'Save Changes' : 'Add Candidate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

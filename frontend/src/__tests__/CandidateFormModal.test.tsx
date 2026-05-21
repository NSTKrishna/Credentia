import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateFormModal } from '@/components/candidates/CandidateFormModal';

describe('CandidateFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    render(<CandidateFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Add New Candidate')).toBeInTheDocument();
  });

  it('blocks submit if Aadhaar is not exactly 12 digits', async () => {
    const { container } = render(<CandidateFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    // Fill basic valid fields to isolate Aadhaar
    await userEvent.type(container.querySelector('input[name="fullName"]')!, 'Jane Doe');
    await userEvent.type(container.querySelector('input[name="email"]')!, 'jane@example.com');
    await userEvent.type(container.querySelector('input[name="phone"]')!, '1234567890');
    await userEvent.type(container.querySelector('input[name="panNumber"]')!, 'ABCDE1234F');
    await userEvent.type(container.querySelector('input[name="dob"]')!, '1990-01-01');
    await userEvent.type(container.querySelector('textarea[name="address"]')!, '123 Main Street Rd');

    // Fill invalid Aadhaar (short)
    await userEvent.type(container.querySelector('input[name="aadhaarNumber"]')!, '123456'); // 6 digits

    fireEvent.click(screen.getByRole('button', { name: /Add Candidate/i }));

    await waitFor(() => {
      expect(screen.getByText(/Aadhaar must be exactly 12 digits/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('blocks submit if PAN format is wrong', async () => {
    const { container } = render(<CandidateFormModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    // Fill basic valid fields
    await userEvent.type(container.querySelector('input[name="fullName"]')!, 'Jane Doe');
    await userEvent.type(container.querySelector('input[name="email"]')!, 'jane@example.com');
    await userEvent.type(container.querySelector('input[name="phone"]')!, '1234567890');
    await userEvent.type(container.querySelector('input[name="aadhaarNumber"]')!, '123456789012');
    await userEvent.type(container.querySelector('input[name="dob"]')!, '1990-01-01');
    await userEvent.type(container.querySelector('textarea[name="address"]')!, '123 Main Street Rd');

    // Fill invalid PAN format
    await userEvent.type(container.querySelector('input[name="panNumber"]')!, '1234ABCDEF'); 

    fireEvent.click(screen.getByRole('button', { name: /Add Candidate/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid PAN format/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});

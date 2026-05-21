import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/app/(auth)/login/page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth store and login service
jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    login: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows error on invalid email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText(/name@company.com/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.submit(emailInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows error if password is empty', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText(/name@company.com/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.submit(emailInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});

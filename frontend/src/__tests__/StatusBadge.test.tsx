import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders VERIFIED status in green', () => {
    render(<StatusBadge status="VERIFIED" />);
    const badge = screen.getByText('VERIFIED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-700');
  });

  it('renders FAILED status in red', () => {
    render(<StatusBadge status="FAILED" />);
    const badge = screen.getByText('FAILED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-700');
  });

  it('renders PENDING status in amber', () => {
    render(<StatusBadge status="PENDING" />);
    const badge = screen.getByText('PENDING');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-700');
  });

  it('renders PARTIAL status in orange', () => {
    render(<StatusBadge status="PARTIAL" />);
    const badge = screen.getByText('PARTIAL');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-orange-100');
    expect(badge).toHaveClass('text-orange-700');
  });

  it('renders default fallback style for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    const badge = screen.getByText('UNKNOWN_STATUS');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-100');
    expect(badge).toHaveClass('text-slate-700');
  });
});

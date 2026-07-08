import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from '../pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />);
    expect(container.querySelector('nav')).toBeNull();
  });

  it('shows prev/next and numbered pages for small page counts', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);

    expect(screen.getByLabelText('Halaman 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Halaman 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Halaman 2')).toHaveAttribute('aria-current', 'page');

    screen.getByLabelText('Halaman 4').click();
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('collapses to ellipsis for large page counts and flags the current page', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={10} pageCount={20} onPageChange={onPageChange} />);

    // First, last, and a window around the current page should be present
    expect(screen.getByLabelText('Halaman 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Halaman 20')).toBeInTheDocument();
    expect(screen.getByLabelText('Halaman 10')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('disables prev on the first page and next on the last page', () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Halaman sebelumnya')).toBeDisabled();

    rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Halaman berikutnya')).toBeDisabled();
  });
});

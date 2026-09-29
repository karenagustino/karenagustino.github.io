import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// This suite is the regression guard on an explicit requirement: the garden was
// added AROUND the existing footer, and the original copy and contact link have
// to survive every change to it.

test('keeps the existing thank-you line', () => {
    render(<Footer />);
    expect(screen.getByText(/thank you for making it this far/i)).toBeInTheDocument();
});

test('keeps the contact link pointing at the same mailbox', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'here' });
    expect(link).toHaveAttribute('href', 'mailto:karenagustino20@gmail.com');
});

test('keeps the invitation to chat', () => {
    render(<Footer />);
    expect(screen.getByText(/i'm always happy to chat/i)).toBeInTheDocument();
});

test('shows the garden heading', () => {
    render(<Footer />);
    expect(screen.getByText("let's grow something")).toBeInTheDocument();
});

test('renders inside a footer landmark', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeInTheDocument();
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContent } from './App';

test('renders the home route by default', () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <AppContent />
        </MemoryRouter>
    );
    expect(screen.getByText(/hello, i'm/i)).toBeInTheDocument();
});

test('clicking "works" navigates to the works page', () => {
    render(
        <MemoryRouter initialEntries={['/']}>
            <AppContent />
        </MemoryRouter>
    );
    fireEvent.click(screen.getByText('works'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('works');
});

test('clicking "garden" while on /works navigates home and scrolls to the projects section', async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(
        <MemoryRouter initialEntries={['/works']}>
            <AppContent />
        </MemoryRouter>
    );
    fireEvent.click(screen.getByText('garden'));
    expect(await screen.findByText(/hello, i'm/i)).toBeInTheDocument();
    await waitFor(() => expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled());
});

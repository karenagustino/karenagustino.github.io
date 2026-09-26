import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page content', () => {
    render(<App />);
    expect(screen.getByText(/hello, i'm/i)).toBeInTheDocument();
});

test('clicking "works" scrolls to the works section', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(<App />);
    fireEvent.click(screen.getByText('works'));
    const worksSection = document.getElementById('works-section');
    expect(worksSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
});

test('clicking "garden" scrolls to the projects section', () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(<App />);
    fireEvent.click(screen.getByText('garden'));
    const projectsSection = document.getElementById('projects-section');
    expect(projectsSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
});

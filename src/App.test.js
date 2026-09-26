import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page content', () => {
    render(<App />);
    expect(screen.getByText(/hello, i'm/i)).toBeInTheDocument();
});

test('clicking "works" scrolls to the works section', () => {
    const scrollSpy = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;
    render(<App />);
    fireEvent.click(screen.getByText('works'));
    const worksSection = document.getElementById('works-section');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(scrollSpy.mock.instances[0]).toBe(worksSection);
});

test('clicking "garden" scrolls to the projects section', () => {
    const scrollSpy = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;
    render(<App />);
    fireEvent.click(screen.getByText('garden'));
    const projectsSection = document.getElementById('projects-section');
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(scrollSpy.mock.instances[0]).toBe(projectsSection);
});

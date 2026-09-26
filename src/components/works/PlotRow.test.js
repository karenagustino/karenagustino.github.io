import { fireEvent, render, screen } from '@testing-library/react';
import PlotRow from './PlotRow';

const sampleCaseStudies = [
    { id: 'a', title: 'A', tagline: 'Tagline A', tech: ['React'] },
    { id: 'b', title: 'B', tagline: 'Tagline B', tech: ['Flask'] },
];

test('renders one card per case study', () => {
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
});

test('clicking the right arrow scrolls the track forward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Next case study'));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 304, behavior: 'smooth' });
});

test('clicking the left arrow scrolls the track backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Previous case study'));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -304, behavior: 'smooth' });
});

test('pressing ArrowRight on the track scrolls forward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowRight' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 304, behavior: 'smooth' });
});

test('pressing ArrowLeft on the track scrolls backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowLeft' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -304, behavior: 'smooth' });
});

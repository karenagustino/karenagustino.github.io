import { fireEvent, render, screen } from '@testing-library/react';
import PlotRow from './PlotRow';

const sampleCaseStudies = [
    {
        id: 'a', title: 'A', tagline: 'Tagline A', tech: ['React'],
        role: 'Developer', timeframe: '2024', problem: 'Problem A',
        process: ['Step A1'], outcome: 'Outcome A',
    },
    {
        id: 'b', title: 'B', tagline: 'Tagline B', tech: ['Flask'],
        role: 'Developer', timeframe: '2024', problem: 'Problem B',
        process: ['Step B1'], outcome: 'Outcome B',
    },
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
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 404, behavior: 'smooth' });
});

test('clicking the left arrow scrolls the track backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Previous case study'));
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -404, behavior: 'smooth' });
});

test('pressing ArrowRight on the track scrolls forward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowRight' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 404, behavior: 'smooth' });
});

test('pressing ArrowLeft on the track scrolls backward', () => {
    Element.prototype.scrollBy = jest.fn();
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    fireEvent.keyDown(screen.getByRole('list'), { key: 'ArrowLeft' });
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: -404, behavior: 'smooth' });
});

test('a real drag does not also expand the card underneath', () => {
    render(<PlotRow caseStudies={sampleCaseStudies} />);
    const track = screen.getByRole('list');
    const card = screen.getByText('A');

    fireEvent.pointerDown(card, { pointerType: 'mouse', clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(track, { clientX: 50, pointerId: 1 });
    fireEvent.pointerUp(card, { pointerId: 1 });
    fireEvent.click(card);

    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

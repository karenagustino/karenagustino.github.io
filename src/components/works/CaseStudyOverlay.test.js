import { fireEvent, render, screen } from '@testing-library/react';
import CaseStudyOverlay from './CaseStudyOverlay';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    role: 'Lead Developer',
    timeframe: 'Jan 2025 - Mar 2025',
    problem: 'Users could not find the checkout button.',
    process: ['Interviewed 5 users', 'Redesigned the checkout flow'],
    outcome: 'Checkout completion rate rose by 20%.',
};

test('renders the case study detail text', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.problem)).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[0])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[1])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.outcome)).toBeInTheDocument();
});

test('the overlay exposes modal dialog semantics', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
});

test('clicking the close button calls onClose', () => {
    const handleClose = jest.fn();
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Close case study'));
    expect(handleClose).toHaveBeenCalledTimes(1);
});

test('clicking the overlay body calls onClose', () => {
    const handleClose = jest.fn();
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={handleClose} />);
    fireEvent.click(screen.getByText(sampleCaseStudy.outcome));
    expect(handleClose).toHaveBeenCalledTimes(1);
});

import { fireEvent, render, screen } from '@testing-library/react';
import CaseStudyCard from './CaseStudyCard';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    tagline: 'A sample tagline',
    tech: ['React', 'Flask'],
    role: 'Lead Developer',
    timeframe: 'Jan 2025 - Mar 2025',
    problem: 'Users could not find the checkout button.',
    process: ['Interviewed 5 users', 'Redesigned the checkout flow'],
    outcome: 'Checkout completion rate rose by 20%.',
};

test('renders the title, tagline, and tech list when collapsed', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.getByText('React · Flask')).toBeInTheDocument();
});

test('clicking the card expands it to show problem, process, and outcome text', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    fireEvent.click(screen.getByText('Sample Project'));

    expect(screen.getByText(sampleCaseStudy.problem)).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[0])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.process[1])).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.outcome)).toBeInTheDocument();
    expect(screen.queryByText('A sample tagline')).not.toBeInTheDocument();
});

test('clicking the expanded card body collapses it again', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    fireEvent.click(screen.getByText('Sample Project'));
    fireEvent.click(screen.getByText(sampleCaseStudy.outcome));

    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.queryByText(sampleCaseStudy.problem)).not.toBeInTheDocument();
});

test('clicking the close button collapses the expanded card', () => {
    render(<CaseStudyCard caseStudy={sampleCaseStudy} />);
    fireEvent.click(screen.getByText('Sample Project'));
    fireEvent.click(screen.getByLabelText('Collapse case study'));

    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.queryByText(sampleCaseStudy.problem)).not.toBeInTheDocument();
});

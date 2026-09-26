import { fireEvent, render, screen } from '@testing-library/react';
import CaseStudyCard from './CaseStudyCard';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    tagline: 'A sample tagline',
    tech: ['React', 'Flask'],
};

const samplePositionStyle = {
    transform: 'translate3d(0%, 0, 0px) rotateY(0deg) scale(1)',
    opacity: 1,
    zIndex: 100,
    pointerEvents: 'auto',
};

test('renders the title, tagline, and tech list', () => {
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={() => {}}
        />
    );
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('A sample tagline')).toBeInTheDocument();
    expect(screen.getByText('React · Flask')).toBeInTheDocument();
});

test('has an accessible label and is keyboard-focusable when active', () => {
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={() => {}}
        />
    );
    expect(screen.getByLabelText('Sample Project — open full screen')).toHaveAttribute('tabindex', '0');
});

test('is not keyboard-focusable when not active', () => {
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive={false}
            onClick={() => {}}
        />
    );
    expect(screen.getByLabelText('Sample Project — open full screen')).toHaveAttribute('tabindex', '-1');
});

test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={handleClick}
        />
    );
    fireEvent.click(screen.getByText('Sample Project'));
    expect(handleClick).toHaveBeenCalledTimes(1);
});

test('calls onClick when Enter is pressed', () => {
    const handleClick = jest.fn();
    render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={handleClick}
        />
    );
    fireEvent.keyDown(screen.getByText('Sample Project'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
});

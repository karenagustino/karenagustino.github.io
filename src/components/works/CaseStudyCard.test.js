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

// ── coming soon cards ──
// A real unwritten entry: a title, a flag, and nothing else.
const comingSoonStudy = {
    id: 'not-written-yet',
    title: 'Case study 02',
    comingSoon: true,
};

const renderComingSoon = (onClick = () => {}) =>
    render(
        <CaseStudyCard
            caseStudy={comingSoonStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={onClick}
        />
    );

test('a coming soon card is not offered as a button', () => {
    const { container } = renderComingSoon();
    expect(container.querySelector('[role="button"]')).toBeNull();
});

test('a coming soon card is not keyboard focusable, even when active', () => {
    const { container } = renderComingSoon();
    const card = container.querySelector('.case-study-card');
    expect(card).not.toHaveAttribute('tabindex', '0');
});

test('clicking a coming soon card does nothing', () => {
    const onClick = jest.fn();
    const { container } = renderComingSoon(onClick);
    fireEvent.click(container.querySelector('.case-study-card'));
    expect(onClick).not.toHaveBeenCalled();
});

test('pressing Enter on a coming soon card does nothing', () => {
    const onClick = jest.fn();
    const { container } = renderComingSoon(onClick);
    fireEvent.keyDown(container.querySelector('.case-study-card'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
});

// Touch has no hover, so the cursor alone would leave a locked card silently
// inert. The badge is the part everyone gets.
test('a coming soon card says so on its face', () => {
    renderComingSoon();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
});

test('a written card is still a button and still opens', () => {
    const onClick = jest.fn();
    const { container } = render(
        <CaseStudyCard
            caseStudy={sampleCaseStudy}
            positionStyle={samplePositionStyle}
            isActive
            onClick={onClick}
        />
    );
    expect(container.querySelector('[role="button"]')).toBeInTheDocument();
    fireEvent.click(container.querySelector('.case-study-card'));
    expect(onClick).toHaveBeenCalled();
});

test('a coming soon card renders from a title alone, with no tagline or tech line', () => {
    const { container } = renderComingSoon();
    expect(screen.getByText('Case study 02')).toBeInTheDocument();
    expect(container.querySelector('.case-study-card-tagline')).toBeNull();
    expect(container.querySelector('.case-study-card-tech')).toBeNull();
});

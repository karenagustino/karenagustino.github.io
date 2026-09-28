import { act, fireEvent, render, screen } from '@testing-library/react';
import PlotStage from './PlotStage';

// The outside-click listener is attached a tick after the overlay opens, so the
// opening click doesn't immediately close it again. Tests that click outside
// have to let that tick elapse first.
const flushOutsideClickListener = async () => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
};

// Closing the overlay plays a fade-out first; it only unmounts once that
// animation reports finishing. jsdom never runs CSS animations, so tests have
// to end it by hand.
const finishOverlayExit = () => {
    fireEvent.animationEnd(screen.getByRole('dialog'));
};

// Only the fields PlotStage and its children actually read. The overlay renders
// from `sections`, so each entry carries one, and 'Problem A' below is the text
// the overlay-visibility assertions key off.
const sampleCaseStudy = (letter) => ({
    id: letter.toLowerCase(),
    title: letter,
    tagline: `Tagline ${letter}`,
    tech: ['React'],
    role: 'Dev',
    timeframe: '2024',
    sections: [
        {
            id: 'overview',
            icon: '\u{1F4D6}',
            title: 'Overview',
            blocks: [{ type: 'prose', text: `Problem ${letter}` }],
        },
    ],
});

const sampleCaseStudies = ['A', 'B', 'C', 'D'].map(sampleCaseStudy);


test('renders one card per case study', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
});

test('the first card starts active', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '-1');
});

test('clicking a side card makes it active', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('C'));
    expect(screen.getByLabelText('C — open full screen')).toHaveAttribute('tabindex', '0');
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '-1');
});

test('the next arrow advances the active card', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Next case study'));
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '0');
});

test('the previous arrow wraps from the first card to the last', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Previous case study'));
    expect(screen.getByLabelText('D — open full screen')).toHaveAttribute('tabindex', '0');
});

test('the next arrow wraps from the last card back to the first', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByLabelText('Next case study'));
    fireEvent.click(screen.getByLabelText('Next case study'));
    fireEvent.click(screen.getByLabelText('Next case study'));
    fireEvent.click(screen.getByLabelText('Next case study'));
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
});

test('clicking the active card opens the overlay with its detail text', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();
});

test('pressing Escape while the overlay is open closes it', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText('Case studies — drag, click a card, or use arrow keys to browse'), { key: 'Escape' });
    finishOverlayExit();
    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

test('a drag past the midpoint between two cards changes the active card', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    const track = screen.getByLabelText('Case studies — drag, click a card, or use arrow keys to browse');
    fireEvent.pointerDown(track, { pointerType: 'mouse', clientX: 200 });
    fireEvent.pointerMove(track, { clientX: 200 - 161 });
    fireEvent.pointerUp(track);
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '0');
});

test('a drag that does not cross the midpoint snaps back to the original card', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    const track = screen.getByLabelText('Case studies — drag, click a card, or use arrow keys to browse');
    fireEvent.pointerDown(track, { pointerType: 'mouse', clientX: 200 });
    fireEvent.pointerMove(track, { clientX: 200 - 50 });
    fireEvent.pointerUp(track);
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
});

test('a drag released outside the track still finishes, and does not stay stuck', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    const track = screen.getByLabelText('Case studies — drag, click a card, or use arrow keys to browse');
    fireEvent.pointerDown(track, { pointerType: 'mouse', clientX: 200 });
    fireEvent.pointerMove(window, { clientX: 200 - 161 });
    // Release over the arrow button, outside the <ul>.
    fireEvent.pointerUp(screen.getByLabelText('Next case study'));
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '0');

    // A bare pointermove with no button held must no longer move the carousel.
    fireEvent.pointerMove(window, { clientX: 200 - 500 });
    expect(screen.getByLabelText('B — open full screen')).toHaveAttribute('tabindex', '0');
});

test('dragging while the overlay is open cannot swap the case study behind it', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();

    const track = screen.getByLabelText('Case studies — drag, click a card, or use arrow keys to browse');
    fireEvent.pointerDown(track, { pointerType: 'mouse', clientX: 200 });
    fireEvent.pointerMove(window, { clientX: 200 - 500 });
    fireEvent.pointerUp(window);

    expect(screen.getByText('Problem A')).toBeInTheDocument();
    expect(screen.queryByText('Problem C')).not.toBeInTheDocument();
});

test('the arrow buttons are disabled while the overlay is open', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    expect(screen.getByLabelText('Next case study')).not.toBeDisabled();
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByLabelText('Next case study')).toBeDisabled();
    expect(screen.getByLabelText('Previous case study')).toBeDisabled();
});

test('Escape closes the overlay even when focus has moved off the track', () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();
    // Focus has moved away from the track — the key press lands on the body.
    fireEvent.keyDown(document.body, { key: 'Escape' });
    finishOverlayExit();
    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

test('clicking outside the overlay closes it', async () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Problem A')).toBeInTheDocument();

    await flushOutsideClickListener();
    fireEvent.click(document.body);
    finishOverlayExit();

    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

test('the overlay fades out before unmounting rather than vanishing', async () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    await flushOutsideClickListener();

    fireEvent.click(document.body);

    // Still on screen, now playing its exit animation.
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('case-study-overlay--closing');
    expect(screen.getByText('Problem A')).toBeInTheDocument();

    fireEvent.animationEnd(panel);
    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

test('an animation ending on a child does not cut the exit short', async () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    await flushOutsideClickListener();
    fireEvent.click(document.body);

    // Bubbles to the panel's handler, but originates on a child.
    fireEvent.animationEnd(screen.getByText('Problem A'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('the click that opens the overlay does not immediately close it again', async () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));

    await flushOutsideClickListener();

    expect(screen.getByText('Problem A')).toBeInTheDocument();
});

test('clicking inside the overlay panel does not close it via the outside-click handler', async () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    await flushOutsideClickListener();

    // The close button lives inside the panel: it closes through its own
    // handler, not by being mistaken for an outside click.
    fireEvent.click(screen.getByLabelText('Close case study'));
    finishOverlayExit();

    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
});

test('clicking a side card while the overlay is open only closes it, without switching cards', async () => {
    render(<PlotStage caseStudies={sampleCaseStudies} />);
    fireEvent.click(screen.getByText('A'));
    await flushOutsideClickListener();

    fireEvent.click(screen.getByText('C'));
    finishOverlayExit();

    expect(screen.queryByText('Problem A')).not.toBeInTheDocument();
    expect(screen.getByLabelText('A — open full screen')).toHaveAttribute('tabindex', '0');
});

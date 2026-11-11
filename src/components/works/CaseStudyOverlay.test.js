import { act, fireEvent, render, screen } from '@testing-library/react';
import CaseStudyOverlay, { toFigmaEmbedUrl } from './CaseStudyOverlay';

const sampleCaseStudy = {
    id: 'sample-1',
    title: 'Sample Project',
    role: 'Lead Developer',
    timeframe: '2025',
    tags: ['PRODUCT', 'RESEARCH'],
    stats: [{ value: '250+', label: 'surveyed' }],
    note: 'Details generalized to respect confidentiality.',
    sections: [
        {
            id: 'overview',
            icon: '📖',
            title: 'Overview',
            blocks: [{ type: 'prose', text: 'Users could not find the checkout button.' }],
        },
        {
            id: 'research',
            icon: '🔍',
            title: 'Research',
            blocks: [
                { type: 'prose', text: 'Three agents, one per source.' },
                {
                    type: 'rows',
                    items: [{ label: 'Funnel agent', text: 'Read the funnel analytics.' }],
                },
            ],
        },
        {
            id: 'impact',
            icon: '💥',
            title: 'Impact',
            blocks: [
                {
                    type: 'metrics',
                    items: [{ value: '250+', label: 'Clients surveyed', caption: 'phase two' }],
                },
            ],
        },
    ],
};

test('renders every section heading', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: /Overview/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Research/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Impact/ })).toBeInTheDocument();
});

test('renders the header identity, stats, tags and confidentiality note', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('Lead Developer · 2025')).toBeInTheDocument();
    expect(screen.getByText('surveyed')).toBeInTheDocument();
    expect(screen.getByText('PRODUCT')).toBeInTheDocument();
    expect(screen.getByText(sampleCaseStudy.note)).toBeInTheDocument();
});

test('renders prose, row and metric blocks', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    expect(screen.getByText('Users could not find the checkout button.')).toBeInTheDocument();
    expect(screen.getByText('Funnel agent')).toBeInTheDocument();
    expect(screen.getByText('Read the funnel analytics.')).toBeInTheDocument();
    expect(screen.getByText('Clients surveyed')).toBeInTheDocument();
    expect(screen.getByText('phase two')).toBeInTheDocument();
});

test('the sidebar lists one entry per section, with the first one current', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Case study sections' });
    const items = nav.querySelectorAll('button');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('aria-current', 'true');
    expect(items[1]).not.toHaveAttribute('aria-current');
});

test('clicking a sidebar entry makes that section current', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Case study sections' });
    fireEvent.click(screen.getByRole('button', { name: /Impact/ }));
    const items = nav.querySelectorAll('button');
    expect(items[2]).toHaveAttribute('aria-current', 'true');
    expect(items[0]).not.toHaveAttribute('aria-current');
});

test('the overlay exposes modal dialog semantics', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Sample Project');
});

test('clicking the close button calls onClose', () => {
    const handleClose = jest.fn();
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Close case study'));
    expect(handleClose).toHaveBeenCalledTimes(1);
});

// The old card-sized panel closed on any click inside it. That would now fire
// while the reader is selecting text or scrolling a long document, so the panel
// body is inert and only the close button, Escape, or a click outside dismiss it.
test('clicking the overlay body does not call onClose', () => {
    const handleClose = jest.fn();
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={handleClose} />);
    fireEvent.click(screen.getByText('Users could not find the checkout button.'));
    expect(handleClose).not.toHaveBeenCalled();
});

test('reports its exit only once the closing animation has finished', () => {
    const handleExited = jest.fn();
    const { rerender } = render(
        <CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} onExited={handleExited} />
    );

    // While open, a finished entry animation must not be mistaken for an exit.
    fireEvent.animationEnd(screen.getByRole('dialog'));
    expect(handleExited).not.toHaveBeenCalled();

    rerender(
        <CaseStudyOverlay caseStudy={sampleCaseStudy} closing onClose={() => {}} onExited={handleExited} />
    );
    expect(screen.getByRole('dialog')).toHaveClass('case-study-overlay--closing');

    fireEvent.animationEnd(screen.getByRole('dialog'));
    expect(handleExited).toHaveBeenCalledTimes(1);
});

test('an animation ending on a child does not report the exit', () => {
    const handleExited = jest.fn();
    render(
        <CaseStudyOverlay caseStudy={sampleCaseStudy} closing onClose={() => {}} onExited={handleExited} />
    );
    fireEvent.animationEnd(screen.getByText('Users could not find the checkout button.'));
    expect(handleExited).not.toHaveBeenCalled();
});

test('labels the case file with its position in the set', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} index={2} total={4} onClose={() => {}} />);
    expect(screen.getByText('CASE FILE 03 / 04')).toBeInTheDocument();
});

test('numbers the chapters and the section headings in step', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    // Two numbered chips per section: one in the chapter list, one on the heading.
    expect(screen.getAllByText('01')).toHaveLength(2);
    expect(screen.getAllByText('03')).toHaveLength(2);
});

// jsdom reports every element as zero-sized, so the meter can only be checked
// for its starting state and its wiring here; the scrolled values are verified
// in a real browser.
test('exposes reading progress as a progressbar starting at zero', () => {
    render(<CaseStudyOverlay caseStudy={sampleCaseStudy} onClose={() => {}} />);
    const meter = screen.getByRole('progressbar', { name: 'Reading progress' });
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('00%')).toBeInTheDocument();
});

const PROTO_URL = 'https://www.figma.com/proto/abc123/Flow?node-id=1-2&t=tok&scaling=scale-down&show-proto-sidebar=1';

test('turns a prototype share link into an embed without Figma chrome', () => {
    const embed = new URL(toFigmaEmbedUrl(PROTO_URL));
    expect(embed.hostname).toBe('embed.figma.com');
    expect(embed.pathname).toBe('/proto/abc123/Flow');
    expect(embed.searchParams.get('node-id')).toBe('1-2');
    expect(embed.searchParams.get('scaling')).toBe('min-zoom');
    expect(embed.searchParams.get('hide-ui')).toBe('1');
    expect(embed.searchParams.get('embed-host')).toBe('karenagustino-portfolio');
    expect(embed.searchParams.has('show-proto-sidebar')).toBe(false);
    expect(embed.searchParams.has('t')).toBe(false);
});

test('plays a prototype block in a phone frame with a link out to Figma', () => {
    const withPrototype = {
        ...sampleCaseStudy,
        sections: [{
            id: 'prototype',
            icon: '📱',
            title: 'Prototype',
            blocks: [{ type: 'prototype', url: PROTO_URL, label: 'Try the flow', caption: 'Tap through it.' }],
        }],
    };
    render(<CaseStudyOverlay caseStudy={withPrototype} onClose={() => {}} />);
    const frame = screen.getByTitle('Try the flow');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(toFigmaEmbedUrl(PROTO_URL));
    expect(screen.getByRole('link', { name: /open in figma/i })).toHaveAttribute('href', PROTO_URL);
});

const renderPrototype = (extra = {}) => render(
    <CaseStudyOverlay
        caseStudy={{
            ...sampleCaseStudy,
            sections: [{
                id: 'prototype',
                icon: '📱',
                title: 'Prototype',
                blocks: [{ type: 'prototype', url: PROTO_URL, label: 'Try the flow', ...extra }],
            }],
        }}
        onClose={() => {}}
    />,
);

const postFromFigma = (iframe, data) => act(() => {
    window.dispatchEvent(new MessageEvent('message', {
        data, origin: 'https://www.figma.com', source: iframe.contentWindow,
    }));
});

test('covers the screen with a loader until the embed has loaded', () => {
    jest.useFakeTimers();
    try {
        renderPrototype();
        expect(screen.getByRole('status')).toHaveTextContent(/loading prototype/i);
        fireEvent.load(screen.getByTitle('Try the flow'));
        act(() => { jest.advanceTimersByTime(1200); });
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
        jest.useRealTimers();
    }
});

test('start over reloads the embed and shows the loader again', () => {
    jest.useFakeTimers();
    try {
        renderPrototype();
        const first = screen.getByTitle('Try the flow');
        fireEvent.load(first);
        act(() => { jest.advanceTimersByTime(1200); });
        fireEvent.click(screen.getByRole('button', { name: /start over/i }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByTitle('Try the flow')).not.toBe(first);
    } finally {
        jest.useRealTimers();
    }
});

test('offers a replay on the last screen once Figma reports reaching it', () => {
    renderPrototype({ endNodeId: '9:9' });
    const iframe = screen.getByTitle('Try the flow');
    postFromFigma(iframe, { type: 'INITIAL_LOAD', data: {} });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    postFromFigma(iframe, { type: 'PRESENTED_NODE_CHANGED', data: { presentedNodeId: '1:2' } });
    expect(screen.queryByRole('button', { name: /replay/i })).not.toBeInTheDocument();

    postFromFigma(iframe, { type: 'PRESENTED_NODE_CHANGED', data: { presentedNodeId: '9:9' } });
    const post = jest.spyOn(iframe.contentWindow, 'postMessage').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: /replay/i }));
    expect(post).toHaveBeenCalledWith({ type: 'RESTART' }, 'https://www.figma.com');
    expect(screen.queryByRole('button', { name: /replay/i })).not.toBeInTheDocument();
});

test('ignores messages that do not come from Figma', () => {
    renderPrototype({ endNodeId: '9:9' });
    act(() => {
        window.dispatchEvent(new MessageEvent('message', {
            data: { type: 'INITIAL_LOAD', data: {} }, origin: 'https://evil.example',
        }));
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
});

test('adds the client id to the embed only when one is set', () => {
    expect(new URL(toFigmaEmbedUrl(PROTO_URL, '')).searchParams.has('client-id')).toBe(false);
    expect(new URL(toFigmaEmbedUrl(PROTO_URL, 'abc')).searchParams.get('client-id')).toBe('abc');
});

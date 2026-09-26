import { render, screen } from '@testing-library/react';
import Works from './Works';

test('renders a heading and one card per case study', () => {
    render(<Works />);
    expect(screen.getByRole('heading', { level: 2, name: /the garden of case studies/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

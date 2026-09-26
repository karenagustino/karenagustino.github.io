import { render, screen } from '@testing-library/react';
import WorksPage from './WorksPage';

test('renders a page heading and one card per case study', () => {
    render(<WorksPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
});

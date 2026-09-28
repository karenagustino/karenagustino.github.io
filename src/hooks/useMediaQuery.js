import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query. Used for the garden's reduced-motion and touch
 * branches, which have to react to a change mid-session rather than only being
 * read once at mount.
 *
 * Guarded for environments without matchMedia and for Safari versions that only
 * expose the deprecated addListener/removeListener pair.
 */
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches
    );

    useEffect(() => {
        if (!window.matchMedia) return undefined;
        const list = window.matchMedia(query);
        const onChange = (event) => setMatches(event.matches);
        setMatches(list.matches);
        if (list.addEventListener) list.addEventListener('change', onChange);
        else list.addListener(onChange);
        return () => {
            if (list.removeEventListener) list.removeEventListener('change', onChange);
            else list.removeListener(onChange);
        };
    }, [query]);

    return matches;
}

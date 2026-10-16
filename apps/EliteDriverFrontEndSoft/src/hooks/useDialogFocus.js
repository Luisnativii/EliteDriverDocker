import { useEffect, useRef } from 'react';

// Escape, focus containment and return to the opening control for dialogs and mobile navigation.
export function useDialogFocus(open, onClose) {
    const ref = useRef(null);
    const close = useRef(onClose);
    useEffect(() => { close.current = onClose; }, [onClose]);
    useEffect(() => {
        if (!open || !ref.current) return;
        const previous = document.activeElement;
        const root = ref.current;
        const controls = () => [...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')]
            .filter(element => element.getClientRects().length && !element.closest('[inert]'));
        (controls()[0] || root).focus();
        const onKey = event => {
            if (event.key === 'Escape') { event.preventDefault(); close.current(); }
            if (event.key !== 'Tab') return;
            const items = controls();
            if (!items.length) { event.preventDefault(); root.focus(); return; }
            const first = items[0], last = items.at(-1);
            if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
                event.preventDefault(); first.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            if (previous?.isConnected) previous.focus();
        };
    }, [open]);
    return ref;
}

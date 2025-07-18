import { useEffect, useRef } from "react";

export default function WhiteboardOutput({ whiteboardHtml }) {
    const whiteboardRef = useRef(null);

    // Add animation class to elements that changed recently
    useEffect(() => {
        if (whiteboardRef.current) {
            // Find all elements without highlight-update class
            const allElements = whiteboardRef.current.querySelectorAll('*:not(.highlight-update)');

            // Timeouts to track for cleanup
            const timeoutIds = [];

            // Add the highlight class to newly added or updated elements
            allElements.forEach(el => {
                if (el.id) {
                    el.classList.add('highlight-update');

                    // Remove the class after the animation completes
                    const timeoutId = setTimeout(() => {
                        if (el && el.classList) {
                            el.classList.remove('highlight-update');
                        }
                    }, 2000);

                    timeoutIds.push(timeoutId);
                }
            });

            // Cleanup function to clear all timeouts when component unmounts or HTML changes
            return () => {
                timeoutIds.forEach(id => clearTimeout(id));
            };
        }
    }, [whiteboardHtml]);

    return (
        <div
            className="flex-1 grow"
            ref={whiteboardRef}
            dangerouslySetInnerHTML={{ __html: whiteboardHtml }}
        />
    );
}

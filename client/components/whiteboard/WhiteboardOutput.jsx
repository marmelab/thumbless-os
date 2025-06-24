import { useEffect, useRef } from "react";

export default function WhiteboardOutput({ whiteboardHtml, isLoading }) {
    const isWelcomeScreen = whiteboardHtml.includes("Welcome to AI Teaching Assistant");
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
            ref={whiteboardRef}
            className={`w-full grow bg-white rounded-md p-4 overflow-y-auto border-2 align-center ${isLoading ? 'border-blue-400 pulse-border' :
                (isWelcomeScreen ? 'border-green-300' : 'border-gray-300')
                }`}
            dangerouslySetInnerHTML={{ __html: `<div class="prose prose-slate lg:prose-m">${whiteboardHtml}</div>` }}
        />
    );
}

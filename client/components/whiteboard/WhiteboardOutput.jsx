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
        <div className="relative w-full h-full text-lg">
            <div
                ref={whiteboardRef}
                className={`w-full h-full bg-white rounded-md p-4 overflow-y-auto border-2 ${isLoading ? 'border-blue-400 pulse-border' :
                    (isWelcomeScreen ? 'border-green-300' : 'border-gray-300')
                    }`}
                dangerouslySetInnerHTML={{ __html: `<div class="prose prose-slate lg:prose-m">${whiteboardHtml}</div>` }}
            />
            {isLoading ? (
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    Visualizing...
                </div>
            ) : isWelcomeScreen ? (
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                    Waiting for your question...
                </div>
            ) : whiteboardHtml.trim() === "" ? (
                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                    Waiting for visuals...
                </div>
            ) : null}
        </div>
    );
}

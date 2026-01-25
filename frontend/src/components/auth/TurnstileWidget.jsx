import React, { useEffect, useRef } from 'react';

export default function TurnstileWidget({ onVerify, onError, onExpire }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        // Prevent multiple renders
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        // Function to render Turnstile
        const renderTurnstile = () => {
            if (!containerRef.current) return;
            
            // Check if already rendered
            if (widgetIdRef.current !== null) {
                console.log('⚠️ Turnstile already rendered, skipping...');
                return;
            }

            // Check if Turnstile API is loaded
            if (window.turnstile) {
                try {
                    console.log('✅ Rendering Cloudflare Turnstile...');
                    
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: '0x4AAAAAACP1-1H5SaiQ7Zxj',
                        callback: (token) => {
                            console.log('✅ Turnstile verified successfully');
                            onVerify(token);
                        },
                        'error-callback': () => {
                            console.log('❌ Turnstile error');
                            if (onError) onError();
                        },
                        'expired-callback': () => {
                            console.log('⏰ Turnstile expired');
                            if (onExpire) onExpire();
                        },
                        theme: 'light',
                        size: 'normal'
                    });
                } catch (error) {
                    console.error('Error rendering Turnstile:', error);
                    isLoadingRef.current = false;
                }
            }
        };

        // Load Turnstile script if not already loaded
        const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
        
        if (existingScript) {
            // Script already exists, just render
            if (window.turnstile) {
                renderTurnstile();
            } else {
                // Wait for script to load
                existingScript.addEventListener('load', renderTurnstile);
            }
        } else {
            // Create and load script
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = renderTurnstile;
            document.head.appendChild(script);
        }

        // Cleanup function
        return () => {
            if (widgetIdRef.current !== null && window.turnstile) {
                try {
                    console.log('🧹 Cleaning up Turnstile widget');
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                } catch (error) {
                    console.error('Error removing Turnstile:', error);
                }
            }
            isLoadingRef.current = false;
        };
    }, []); // Empty dependency array - only run once

    return (
        <div 
            ref={containerRef} 
            className="flex justify-center my-4"
            id="turnstile-container"
        />
    );
}
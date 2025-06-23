import { render } from 'preact';
import { App } from './app';
import './style.css';

// Service Worker Registration with Update Detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW: Registered successfully', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('SW: New version found, installing...');

          newWorker.addEventListener('statechange', () => {
            console.log('SW: New worker state:', newWorker.state);
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version is available
                console.log('SW: New version ready, showing update notification');
                // Silent update - no notification needed
                console.log('SW: Silent update in progress');
              } else {
                // First install
                console.log('SW: First install completed');
              }
            }
          });
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('SW: Received message:', event.data);
          if (event.data && event.data.type === 'NEW_VERSION_ACTIVATED') {
            console.log('SW: New version activated, reloading page...');
            // Small delay to ensure everything is ready, then reload
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });

        // Initial update check
        console.log('SW: Checking for updates...');
        registration.update().then(() => {
          console.log('SW: Update check completed');
        }).catch(error => {
          console.log('SW: Update check failed:', error);
        });

        // Periodic update checks (every 30 seconds when page is visible)
        setInterval(() => {
          if (document.visibilityState === 'visible') {
            console.log('SW: Periodic update check');
            registration.update().catch(error => {
              console.log('SW: Periodic update check failed:', error);
            });
          }
        }, 30000);

      })
      .catch((error) => {
        console.log('SW: Registration failed', error);
      });
  });
}

// Removed update modal - silent updates work perfectly

// Removed notification functions - silent updates work perfectly

// Removed manual update functions - silent updates handle everything automatically



render(<App />, document.getElementById('app')); 
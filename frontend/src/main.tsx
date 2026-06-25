import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { applyTheme } from './lib/theme'

// @ts-ignore
import { polyfill } from 'mobile-drag-drop';
// @ts-ignore
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';

// Initialize mobile drag-drop polyfill for touch devices
polyfill({
  dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
  holdToDrag: 300 // hold for 300ms to start dragging, keeping page scroll intact
});

// Apply theme immediately on startup
applyTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


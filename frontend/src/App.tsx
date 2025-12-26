/**
 * Main Application Component
 * 
 * Root component that sets up routing and layout.
 * 
 * Routes:
 * - / → Home
 * - /about → About
 * - /app → Dashboard
 * 
 * Layout:
 * - Navbar (sticky)
 * - Page content
 * - Footer
 * 
 * Security: None (client-side UI only)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { About } from '@/pages/About';
import { Dashboard } from '@/pages/Dashboard';
import '@/styles/globals.css';
import '@/styles/components.css';
import { Toaster } from 'sonner';

export function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Navbar />
                <Toaster position="top-right" richColors theme="dark" />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/app" element={<Dashboard />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

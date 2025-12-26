/**
 * Home Page - Visually Enhanced
 */

import { Hero } from '@/components/home/Hero';
import { UpcomingFeaturesBar } from '@/components/home/UpcomingFeaturesBar';
import { HowItWorks } from '@/components/home/HowItWorks';
import { SystemDiagram } from '@/components/home/SystemDiagram';
import { StorageChoice } from '@/components/home/StorageChoice';
import { TrustSection } from '@/components/home/TrustSection';
import { ClosingSection } from '@/components/home/ClosingSection';

import { AnimatedBackground } from '@/components/home/AnimatedBackground';

export function Home() {
    return (
        <div className="home-page">
            <AnimatedBackground />
            <Hero />
            <UpcomingFeaturesBar />
            <HowItWorks />
            <SystemDiagram />
            <StorageChoice />
            <TrustSection />
            <ClosingSection />
        </div>
    );
}

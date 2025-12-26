import React, { useEffect, useState, useRef } from 'react';
import { Dialog } from '@/components/shared/Dialog';
import { x402, Peer, NodeIdentity } from '@/services/x402';

interface NetworkInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NetworkInfoPanel({ isOpen, onClose }: NetworkInfoPanelProps) {
    const [peers, setPeers] = useState<Peer[]>([]);
    const [identity, setIdentity] = useState<NodeIdentity | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        if (isOpen) {
            // Start Service
            x402.start();
            setIdentity(x402.getIdentity());

            // Subscribe
            const unsubState = x402.subscribeState(setPeers);
            const unsubLog = x402.subscribeLog(msg => {
                setLogs(prev => [...prev.slice(-50), msg]); // Keep last 50
            });

            return () => {
                unsubState();
                unsubLog();
                // We don't stop service so background peering continues
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a1b26] border border-white/10 rounded-xl max-w-md w-full shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-blue-400">ℹ️</span> Network Architecture
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* x402 Protocol Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-mono text-green-400">x402 Protocol Active</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            {identity ? identity.id.substring(0, 16) + '...' : 'Initializing Identity...'}
                        </div>
                    </div>

                    {/* Network Map / Peer Grid */}
                    <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Active Peers ({peers.length})</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {peers.map(peer => (
                                <div key={peer.id} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${peer.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                                        <span className="font-mono text-gray-300">{peer.id.substring(5, 12)}</span>
                                    </div>
                                    <span className="text-gray-500 font-mono">{Math.round(peer.rtt)}ms</span>
                                </div>
                            ))}
                            {peers.length === 0 && (
                                <div className="col-span-2 text-center text-gray-500 italic py-4">
                                    Scanning DHT for peers...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Protocol Log (Terminal) */}
                    <div className="bg-black/80 rounded-lg border border-white/10 font-mono text-[10px] h-48 flex flex-col">
                        <div className="px-3 py-2 border-b border-white/10 text-gray-400 bg-white/5 flex justify-between">
                            <span>Protocol Log</span>
                            <span>LIVE</span>
                        </div>
                        <div ref={logEndRef} className="flex-1 overflow-y-auto p-3 space-y-1 text-gray-300 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className="break-all hover:bg-white/5 px-1 rounded">
                                    <span className="text-gray-500 mr-2">
                                        {log.split(']')[0]}]
                                    </span>
                                    <span className={
                                        log.includes('TX') ? 'text-blue-400' :
                                            log.includes('RX') ? 'text-green-400' :
                                                log.includes('Timeout') ? 'text-red-400' : 'text-gray-300'
                                    }>
                                        {log.split(']')[1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500/20 border border-blue-500"></span>
                            <span>TX (Outgoing)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500"></span>
                            <span>RX (Incoming)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500"></span>
                            <span>Timeout</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5 text-center flex justify-between items-center">
                    <span className="text-xs text-gray-500">v0.1.0-alpha</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

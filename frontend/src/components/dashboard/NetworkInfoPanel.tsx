import React from 'react';
import { Dialog } from '@/components/shared/Dialog';

interface NetworkInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NetworkInfoPanel({ isOpen, onClose }: NetworkInfoPanelProps) {
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
                    {/* Prototype Disclaimer */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
                        <strong>Prototype Simulation:</strong> Network behaviors (sharding, replication, node status) are simulated for demonstration purposes. Encryption is real.
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="text-2xl">🌐</div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Decentralized Storage</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Files are not stored on a central server. They are broken into shards and distributed across a network of peer nodes (IPFS/Filecoin architecture).
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="text-2xl">🔐</div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Zero-Knowledge Encryption</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Files are encrypted on your device before upload. The encryption keys are derived from your wallet signature and never leave your browser.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="text-2xl">⚖️</div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Storage & Replicas</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    <strong>Replicas:</strong> The network maintains 3 copies of every file to ensure durability. <br />
                                    <strong>Earned Storage:</strong> Contributing your own storage (keeping your node online) earns you additional network quota.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5 text-center">
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

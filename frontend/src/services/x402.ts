/**
 * x402 Protocol Service
 * 
 * A custom P2P coordination protocol for Node Discovery, Health Signaling, and Messaging.
 * 
 * key features:
 * - ECDSA Node Identity
 * - Virtual P2P Transport (Simulated Latency/Jitter)
 * - Heartbeat (PING/PONG)
 * - Gossip Protocol for Node Health
 */

import { generateId } from '@/utils/format';

// --- Types ---

export type MessageType = 'HELLO' | 'PING' | 'PONG' | 'NODE_HEALTH' | 'REPLICA_STATUS' | 'DISCONNECT';

export interface ProtocolMessage {
    id: string;
    type: MessageType;
    senderId: string;
    targetId?: string; // Broadcast if undefined
    timestamp: number;
    payload?: any;
    signature?: string; // For authenticity
}

export interface Peer {
    id: string;
    address: string; // Virtual IP
    status: 'connecting' | 'connected' | 'disconnected';
    lastSeen: number;
    rtt: number; // Round Trip Time in ms
    capabilities: string[];
    publicKey?: CryptoKey;
}

export interface NodeIdentity {
    id: string;
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}

// --- Constants ---

const HEARTBEAT_INTERVAL = 5000; // 5s
const PEER_TIMEOUT = 15000; // 15s
const BROADCAST_INTERVAL = 10000; // 10s

// --- Service ---

class X402Network {
    private identity: NodeIdentity | null = null;
    private peers: Map<string, Peer> = new Map();
    private listeners: ((msg: ProtocolMessage) => void)[] = [];
    private stateListeners: ((peers: Peer[]) => void)[] = [];
    private logListeners: ((log: string) => void)[] = [];

    private isRunning = false;
    private timers: NodeJS.Timeout[] = [];

    // Bootstrap Nodes (Virtual)
    private readonly BOOTSTRAP_NODES = [
        { id: 'BOOT-Qm7x', address: '104.23.1.5' },
        { id: 'BOOT-Xf92', address: '185.12.9.2' },
        { id: 'BOOT-Zw3k', address: '211.9.4.1' }
    ];

    constructor() {
        // Auto-start if needed, but usually explicit start is better
    }

    // --- Core Lifecycle ---

    public async params(): Promise<void> {
        // Initialize Identity
    }

    public async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        this.log('Initializing x402 Protocol Stack...');

        // 1. Generate Identity
        if (!this.identity) {
            this.identity = await this.generateIdentity();
            this.log(`Node Identity Created: ${this.identity.id.substring(0, 12)}...`);
        }

        // 2. Start Transport Loop
        this.startTransportLoop();

        // 3. Bootstrap Discovery
        this.startDiscovery();

        // 4. Start Heartbeat
        this.startHeartbeat();

        this.log('x402 Network Online. Listening for peers...');
    }

    public stop(): void {
        this.isRunning = false;
        this.timers.forEach(t => clearInterval(t));
        this.timers = [];
        this.peers.clear();
        this.log('x402 Network Offline.');
    }

    // --- Identity ---

    private async generateIdentity(): Promise<NodeIdentity> {
        // Use Web Crypto for real ECDSA keys
        const pair = await window.crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: 'P-256'
            },
            true,
            ['sign', 'verify']
        );

        // Derive ID from public key (simplified hash)
        const pubBuffer = await window.crypto.subtle.exportKey('spki', pair.publicKey);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', pubBuffer);
        const id = 'x402-' + this.arrayBufferToHex(hashBuffer).substring(0, 16);

        return {
            id,
            publicKey: pair.publicKey,
            privateKey: pair.privateKey
        };
    }

    // --- Transport (Virtual Switchboard) ---

    private startTransportLoop() {
        // Check for timeouts
        const timer = setInterval(() => {
            const now = Date.now();
            this.peers.forEach((peer, id) => {
                if (now - peer.lastSeen > PEER_TIMEOUT) {
                    this.log(`Peer Timeout: ${id} (last seen ${((now - peer.lastSeen) / 1000).toFixed(1)}s ago)`);
                    this.disconnectPeer(id);
                }
            });
            this.notifyState();
        }, 1000);
        this.timers.push(timer);
    }

    public sendMessage(targetId: string, type: MessageType, payload?: any) {
        if (!this.identity) return;

        const msg: ProtocolMessage = {
            id: generateId(),
            type,
            senderId: this.identity.id,
            targetId,
            timestamp: Date.now(),
            payload
        };

        // Simulate Network Latency (50ms - 300ms)
        const latency = 50 + Math.random() * 250;

        setTimeout(() => {
            this.handleOutgoingMessage(msg);
        }, latency);
    }

    public broadcast(type: MessageType, payload?: any) {
        if (!this.identity) return;

        const msg: ProtocolMessage = {
            id: generateId(),
            type,
            senderId: this.identity.id,
            timestamp: Date.now(),
            payload
        };

        this.handleOutgoingMessage(msg);
    }

    private handleOutgoingMessage(msg: ProtocolMessage) {
        this.log(`TX ${msg.type} -> ${msg.targetId || 'BROADCAST'}`);

        // In a real P2P app, this would use WebRTC/WebSocket.
        // Here, we simulate the "Other Side" responding.

        if (msg.targetId) {
            const peer = this.peers.get(msg.targetId);
            if (peer) {
                // Simulate Peer Response Logic
                this.simulatePeerResponse(peer, msg);
            }
        } else {
            // Broadcast goes to all
            this.peers.forEach(peer => this.simulatePeerResponse(peer, msg));
        }
    }

    // --- Simulation Logic (The "Network") ---

    private simulatePeerResponse(peer: Peer, incomingMsg: ProtocolMessage) {
        // Random Packet Loss (5%)
        if (Math.random() < 0.05) {
            this.log(`Packet Loss: ${incomingMsg.type} failed to reach ${peer.id}`);
            return;
        }

        // Response Latency
        const latency = peer.rtt / 2 + (Math.random() * 20);

        setTimeout(() => {
            // Receive logic (Virtual Peer Logic)
            switch (incomingMsg.type) {
                case 'PING':
                    this.receiveMessage({
                        id: generateId(),
                        type: 'PONG',
                        senderId: peer.id,
                        targetId: this.identity!.id,
                        timestamp: Date.now()
                    });
                    break;

                case 'HELLO':
                    this.receiveMessage({
                        id: generateId(),
                        type: 'HELLO', // Ack
                        senderId: peer.id,
                        targetId: this.identity!.id,
                        timestamp: Date.now(),
                        payload: { capabilities: ['x402/1.0', 'storage/v2'] }
                    });
                    break;
            }
        }, latency);
    }

    private receiveMessage(msg: ProtocolMessage) {
        this.log(`RX ${msg.type} <- ${msg.senderId}`);

        // Update Peer State
        const peer = this.peers.get(msg.senderId);
        if (peer) {
            peer.lastSeen = Date.now();
            if (msg.type === 'PONG') {
                // Update RTT
                const start = this.pendingPings.get(msg.senderId);
                if (start) {
                    peer.rtt = Date.now() - start;
                    this.pendingPings.delete(msg.senderId);
                }
            }
        }

        // Notify Listeners
        this.listeners.forEach(cb => cb(msg));
        this.notifyState();
    }

    // --- Discovery & Heartbeat ---

    private startDiscovery() {
        this.log('Starting Peer Discovery (Bootstrap)...');

        // Connect to Bootstrap Nodes
        this.BOOTSTRAP_NODES.forEach((node, index) => {
            setTimeout(() => {
                this.connectToPeer(node.id, node.address);
            }, index * 2000); // Stagger connections
        });

        // Periodic Discovery (DHT Simulation)
        const timer = setInterval(() => {
            if (this.peers.size < 8) {
                // Find a random new peer
                const newPeerId = 'Peer-' + generateId().substring(0, 6);
                const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 10)}.1`;
                this.connectToPeer(newPeerId, randomIP);
            }
        }, 8000);
        this.timers.push(timer);
    }

    private pendingPings = new Map<string, number>();

    private startHeartbeat() {
        const timer = setInterval(() => {
            this.peers.forEach(peer => {
                if (peer.status === 'connected') {
                    this.pendingPings.set(peer.id, Date.now());
                    this.sendMessage(peer.id, 'PING');
                }
            });

            // Occasional Broadcast
            if (Math.random() > 0.7) {
                this.broadcast('NODE_HEALTH', { cpu: 23, memory: 45, storage: 60 });
            }
        }, HEARTBEAT_INTERVAL);
        this.timers.push(timer);
    }

    private connectToPeer(id: string, address: string) {
        if (this.peers.has(id)) return;

        this.log(`Discovered Peer: ${id} @ ${address}`);

        const newPeer: Peer = {
            id,
            address,
            status: 'connecting',
            lastSeen: Date.now(),
            rtt: 0,
            capabilities: []
        };
        this.peers.set(id, newPeer);
        this.notifyState();

        // Send Hello
        this.sendMessage(id, 'HELLO', { version: 'x402/1.0' });

        // Simulate Connection Success
        setTimeout(() => {
            if (this.peers.has(id)) {
                const p = this.peers.get(id)!;
                p.status = 'connected';
                p.rtt = 100 + Math.random() * 100;
                this.log(`Connected to ${id}`);
                this.notifyState();
            }
        }, 1500);
    }

    private disconnectPeer(id: string) {
        if (this.peers.has(id)) {
            const p = this.peers.get(id)!;
            p.status = 'disconnected';
            this.peers.delete(id);
            this.notifyState();
        }
    }

    // --- Utils ---

    public subscribe(cb: (msg: ProtocolMessage) => void) {
        this.listeners.push(cb);
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    }

    public subscribeState(cb: (peers: Peer[]) => void) {
        this.stateListeners.push(cb);
        // Initial Emit
        cb(Array.from(this.peers.values()));
        return () => { this.stateListeners = this.stateListeners.filter(l => l !== cb); };
    }

    public subscribeLog(cb: (log: string) => void) {
        this.logListeners.push(cb);
        return () => { this.logListeners = this.logListeners.filter(l => l !== cb); };
    }

    public getIdentity() {
        return this.identity;
    }

    private notifyState() {
        const list = Array.from(this.peers.values());
        this.stateListeners.forEach(cb => cb(list));
    }

    private log(msg: string) {
        const timestamp = new Date().toLocaleTimeString();
        const line = `[${timestamp}] ${msg}`;
        // console.log(line); // Debug
        this.logListeners.forEach(cb => cb(line));
    }

    private arrayBufferToHex(buffer: ArrayBuffer): string {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

// Singleton Instance
export const x402 = new X402Network();

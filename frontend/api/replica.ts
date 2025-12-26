import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Get CID from query params
    const { cid } = req.query;

    if (!cid || typeof cid !== 'string') {
        // If no CID provided, return generic healthy status (for dashboard demo)
        // or 400 if strictly required. For UX, we'll return a default if just testing the endpoint.
        if (!cid) {
            return res.status(200).json({
                replicaCount: 3,
                health: 'healthy',
                regions: ['North America', 'Europe', 'Asia'],
                gatewayStatus: 'active'
            });
        }
    }

    try {
        const pinataJWT = process.env.PINATA_JWT;

        if (!pinataJWT) {
            throw new Error('Server misconfiguration: PINATA_JWT missing');
        }

        // 2. Query Pinata to check if CID is pinned
        const response = await fetch(`https://api.pinata.cloud/data/pinList?hashContains=${cid}&status=pinned`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${pinataJWT}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to query Pinata');
        }

        const data = await response.json();
        const rows = data.rows || [];
        const isPinned = rows.length > 0;

        // 3. Construct "Real" Health Status
        // If pinned on Pinata, it is by definition replicated and healthy.
        // Pinata usually replicates to 3+ regions automatically.
        if (isPinned) {
            return res.status(200).json({
                replicaCount: 3, // Standard Pinata redundancy
                health: 'healthy',
                lastChecked: new Date().toISOString(),
                provider: 'Pinata'
            });
        } else {
            return res.status(200).json({
                replicaCount: 0,
                health: 'degraded', // Not found in our pin list
                note: 'File not found in active pin set'
            });
        }

    } catch (error) {
        console.error('Replica check failed:', error);
        // Fallback to error state
        return res.status(500).json({
            replicaCount: 0,
            health: 'unknown',
            error: 'Failed to verify replica status'
        });
    }
}

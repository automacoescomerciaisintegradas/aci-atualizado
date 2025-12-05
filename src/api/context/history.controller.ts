import { Router } from "express";
import jwt from "jsonwebtoken";
import { supabase, serviceSupabase, isServiceKeyConfigured } from "@/common/utils/supabaseClient";

const router = Router();

function extractToken(req: any) {
    const auth = req.headers?.authorization as string | undefined;
    if (!auth) return null;
    if (!auth.startsWith("Bearer ")) return null;
    return auth.split(" ")[1];
}

router.post("/history", async (req, res) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Missing Authorization token" });

    if (!process.env.JWT_SECRET) return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });

    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err: any) {
        return res.status(401).json({ error: "Invalid token" });
    }

    const { resource_type, resource_id, action, payload } = req.body;
    if (!resource_type || !resource_id || !action) {
        return res.status(400).json({ error: "Missing required fields: resource_type, resource_id, action" });
    }

    // Determine actor_id: try to resolve user id by email from users table
    const actorEmail = decoded?.sub;
    let actorId: string | null = null;

    try {
        if (actorEmail && supabase) {
            const { data: user, error: userErr } = await supabase.from('users').select('id').eq('email', actorEmail).single();
            if (!userErr && user && user.id) actorId = user.id;
        }
    } catch (err) {
        // ignore: we'll still try to insert without actorId
        console.warn('Could not resolve user id for actor email', actorEmail, err);
    }

    if (!isServiceKeyConfigured() || !serviceSupabase) {
        return res.status(500).json({ error: 'Service role key not configured on server. Cannot insert context history.' });
    }

    try {
        const now = new Date().toISOString();
        const insertPayload: any = {
            resource_type,
            resource_id,
            action,
            payload: payload || null,
            created_at: now,
        };
        if (actorId) insertPayload.actor_id = actorId;

        const { data, error } = await serviceSupabase!.from('context_history').insert([insertPayload]).select();
        if (error) {
            console.warn('Supabase (service) insert error:', error);
            return res.status(500).json({ error: 'Failed to insert context history', detail: error });
        }

        return res.status(201).json({ data: data?.[0] || null });
    } catch (err) {
        console.error('Error inserting context history:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

import { Router } from "express";
import { serviceSupabase, isServiceKeyConfigured } from "@/common/utils/supabaseClient";

const router = Router();

router.post("/create-user", async (req, res) => {
    if (!isServiceKeyConfigured() || !serviceSupabase) {
        return res.status(500).json({ error: 'Service role key not configured on server.' });
    }

    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    try {
        // Create auth user via service key
        // supabase-js v2 admin API: auth.admin.createUser
        // If not available in your version, replace with direct REST call to the Admin endpoint.
        const createResp: any = await (serviceSupabase as any).auth.admin.createUser({
            email,
            password,
            user_metadata: { name }
        });

        if (createResp?.error) {
            return res.status(500).json({ error: 'Failed to create auth user', detail: createResp.error });
        }

        const userId = createResp?.user?.id || null;

        // Insert into public users table for listing (upsert)
        const insertPayload: any = {
            email,
            name: name || null,
            role: role || 'user',
            status: 'active'
        };
        if (userId) insertPayload.id = userId;

        const { data, error } = await (serviceSupabase as any).from('users').upsert(insertPayload, { onConflict: 'email' }).select();
        if (error) {
            return res.status(500).json({ error: 'Failed to insert user record', detail: error });
        }

        return res.status(201).json({ authUser: createResp.user, userRecord: data?.[0] || null });
    } catch (err: any) {
        console.error('admin.create-user error', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
});

export default router;

import { Router } from "express";
import { authMiddleware } from "@/backend/auth";
import { serviceSupabase, isServiceKeyConfigured } from "@/common/utils/supabaseClient";

const router = Router();

// All routes require a valid app JWT (authMiddleware)
router.use(authMiddleware);

function isAdmin(req: any) {
    return req.user && req.user.role === 'admin';
}

router.get("/", async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    if (!isServiceKeyConfigured() || !serviceSupabase) return res.status(500).json({ error: 'Service role key not configured on server.' });

    try {
        const { data, error } = await (serviceSupabase as any).from('users').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error });
        return res.json({ users: data });
    } catch (err: any) {
        console.error('admin/users GET error', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
});

router.post("/", async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    if (!isServiceKeyConfigured() || !serviceSupabase) return res.status(500).json({ error: 'Service role key not configured on server.' });

    const { email, name, role, status, createAuthAccount, password } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    try {
        let authUserId: string | null = null;

        if (createAuthAccount) {
            if (!password) return res.status(400).json({ error: 'password is required when createAuthAccount is true' });
            const createResp: any = await (serviceSupabase as any).auth.admin.createUser({ email, password, user_metadata: { name } });
            if (createResp?.error) {
                return res.status(500).json({ error: 'Failed to create auth user', detail: createResp.error });
            }
            authUserId = createResp?.user?.id || null;
        }

        const payload: any = { email, name: name || null, role: role || 'user', status: status || 'active' };
        if (authUserId) payload.id = authUserId;

        const { data, error } = await (serviceSupabase as any).from('users').upsert(payload, { onConflict: 'email' }).select();
        if (error) return res.status(500).json({ error });

        return res.status(201).json({ user: data?.[0] || null, authUserId });
    } catch (err: any) {
        console.error('admin/users POST error', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
});

router.put("/:id", async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    if (!isServiceKeyConfigured() || !serviceSupabase) return res.status(500).json({ error: 'Service role key not configured on server.' });

    const { id } = req.params;
    const { name, role, status, email } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    try {
        const updatePayload: any = {};
        if (name !== undefined) updatePayload.name = name;
        if (role !== undefined) updatePayload.role = role;
        if (status !== undefined) updatePayload.status = status;
        if (email !== undefined) updatePayload.email = email;

        const { data, error } = await (serviceSupabase as any).from('users').update(updatePayload).eq('id', id).select();
        if (error) return res.status(500).json({ error });
        return res.json({ user: data?.[0] || null });
    } catch (err: any) {
        console.error('admin/users PUT error', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
});

router.delete("/:id", async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
    if (!isServiceKeyConfigured() || !serviceSupabase) return res.status(500).json({ error: 'Service role key not configured on server.' });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id is required' });

    try {
        const { error } = await (serviceSupabase as any).from('users').delete().eq('id', id);
        if (error) return res.status(500).json({ error });
        return res.status(204).send();
    } catch (err: any) {
        console.error('admin/users DELETE error', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
});

export default router;

import { Router } from "express";
import { authMiddleware } from "@/backend/auth";
import { supabase } from "@/common/utils/supabaseClient";

const router = Router();

router.get("/me", authMiddleware, async (req: any, res) => {
    const user = req.user || null;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Attempt to enrich with DB info (role, id)
        if (supabase) {
            const { data, error } = await supabase.from('users').select('id,role,name,email').eq('email', user.email).single();
            if (!error && data) {
                return res.json({ ...user, role: data.role, id: data.id, dbUser: data });
            }
        }
        return res.json(user);
    } catch (err: any) {
        console.error('auth/me error', err);
        return res.status(500).json({ error: err.message || 'Internal error' });
    }
});

export default router;

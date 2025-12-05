// {{ change 2 }}
import { useSettings } from '../hooks/useSettings';
import { getWordPressStats } from '../services/wordpressService';

router = require('express').Router();

// Schema for request body: accept either an ID token (idToken) or an OAuth access token (accessToken)
const googleLoginSchema = z
    .object({
        idToken: z.string().min(1).optional(),
        accessToken: z.string().min(1).optional(),
    })
    .refine((v) => !!v.idToken || !!v.accessToken, {
        message: "Provide either idToken or accessToken",
        path: ["idToken", "accessToken"],
    });

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    const parseResult = googleLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors });
    }

    const { idToken, accessToken } = parseResult.data;

    try {
        let email: string | undefined;
        let name: string | undefined;
        let picture: string | undefined;

        if (idToken) {
            const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
            const payload = ticket.getPayload();
            email = payload?.email;
            name = payload?.name;
            picture = payload?.picture;
        } else if (accessToken) {
            // Verify access token by requesting the userinfo endpoint
            const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!resp.ok) throw new Error("Invalid Google access token");
            const data = await resp.json();
            email = data.email;
            name = data.name;
            picture = data.picture;
        }

        if (!email) throw new Error("Email not found in Google token");

        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured on server");

        const token = jwt.sign({ sub: email, name, picture }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Tenta sincronizar/atualizar o usuário na tabela `users` do Supabase.
        // Não bloqueia o login em caso de erro, apenas loga o problema.
        (async () => {
            try {
                if (supabase) {
                    const now = new Date().toISOString();
                    const upsertPayload: any = {
                        email,
                        name: name || null,
                        photo_url: picture || null,
                        last_login: now,
                    };

                    const { data: upserted, error: upsertError } = await supabase
                        .from("users")
                        .upsert(upsertPayload, { onConflict: "email" })
                        .select();

                    if (upsertError) {
                        console.warn("Supabase: erro ao upsert user:", upsertError);
                    } else {
                        console.log("Supabase: usuário sincronizado:", upserted?.[0] || upserted);
                    }
                } else {
                    console.warn("Supabase client não está inicializado; pulando sincronização de usuário.");
                }
            } catch (err) {
                console.warn("Erro ao sincronizar usuário no Supabase:", err);
            }
        })();

        return res.json({ token, user: { email, name, picture } });
    } catch (e: any) {
        return res.status(401).json({ error: e.message });
    }
});

export default router;

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/services/d1Client.ts
var D1Client = class {
  constructor(db) {
    this.db = db;
  }
  static {
    __name(this, "D1Client");
  }
  async query(sql, params = []) {
    const stmt = this.db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bound.all();
    if (!result.success) {
      throw new Error(result.error || "Database query failed");
    }
    return result.results || [];
  }
  async execute(sql, params = []) {
    const stmt = this.db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    return await bound.run();
  }
  async first(sql, params = []) {
    const stmt = this.db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    return await bound.first();
  }
  async batch(statements) {
    const preparedStatements = statements.map(({ sql, params = [] }) => {
      const stmt = this.db.prepare(sql);
      return params.length > 0 ? stmt.bind(...params) : stmt;
    });
    return await this.db.batch(preparedStatements);
  }
};

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/nanoid/index.browser.js
var nanoid = /* @__PURE__ */ __name((size = 21) => {
  let id = "";
  let bytes = crypto.getRandomValues(new Uint8Array(size |= 0));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}, "nanoid");

// src/services/d1Auth.ts
var D1Auth = class {
  constructor(db) {
    this.db = db;
  }
  static {
    __name(this, "D1Auth");
  }
  /**
   * Registrar novo usuário
   */
  async signUp(email, password, metadata) {
    try {
      const existing = await this.db.first(
        "SELECT * FROM profiles WHERE email = ?",
        [email]
      );
      if (existing) {
        return {
          success: false,
          error: "Este e-mail j\xE1 est\xE1 cadastrado. Tente fazer login."
        };
      }
      const userId = nanoid();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await this.db.execute(
        `INSERT INTO profiles (id, email, full_name, display_name, phone, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [
          userId,
          email,
          metadata?.full_name || null,
          metadata?.full_name?.split(" ")[0] || null,
          metadata?.phone || null,
          metadata?.role || "user",
          now,
          now
        ]
      );
      await this.db.execute(
        `INSERT INTO user_credits (id, user_id, balance, created_at, updated_at)
         VALUES (?, ?, 0, ?, ?)`,
        [nanoid(), userId, now, now]
      );
      const user = await this.db.first(
        "SELECT * FROM profiles WHERE id = ?",
        [userId]
      );
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: error.message || "Erro ao criar conta"
      };
    }
  }
  /**
   * Login de usuário
   * NOTA: Em produção, você precisará adicionar hash de senha!
   * Esta é uma versão simplificada para demonstração
   */
  async signIn(email, password) {
    try {
      const user = await this.db.first(
        "SELECT * FROM profiles WHERE email = ? AND status = ?",
        [email, "active"]
      );
      if (!user) {
        return {
          success: false,
          error: "E-mail ou senha incorretos."
        };
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await this.db.execute(
        "UPDATE profiles SET last_login_at = ?, updated_at = ? WHERE id = ?",
        [now, now, user.id]
      );
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Erro ao fazer login"
      };
    }
  }
  /**
   * Buscar usuário por ID
   */
  async getUser(userId) {
    return await this.db.first(
      "SELECT * FROM profiles WHERE id = ?",
      [userId]
    );
  }
  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userId, data) {
    try {
      const updates = [];
      const values = [];
      if (data.full_name !== void 0) {
        updates.push("full_name = ?");
        values.push(data.full_name);
      }
      if (data.display_name !== void 0) {
        updates.push("display_name = ?");
        values.push(data.display_name);
      }
      if (data.phone !== void 0) {
        updates.push("phone = ?");
        values.push(data.phone);
      }
      if (data.avatar_url !== void 0) {
        updates.push("avatar_url = ?");
        values.push(data.avatar_url);
      }
      if (updates.length === 0) {
        return { success: false, error: "Nenhum dado para atualizar" };
      }
      updates.push("updated_at = ?");
      values.push((/* @__PURE__ */ new Date()).toISOString());
      values.push(userId);
      await this.db.execute(
        `UPDATE profiles SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
      const user = await this.getUser(userId);
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.message || "Erro ao atualizar perfil"
      };
    }
  }
};

// src/services/passwordReset.ts
function generateResetToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(generateResetToken, "generateResetToken");
function generateResetCode() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
__name(generateResetCode, "generateResetCode");
var PasswordResetService = class {
  static {
    __name(this, "PasswordResetService");
  }
  constructor(db, baseUrl, emailConfig) {
    this.db = db;
    this.baseUrl = baseUrl;
    this.emailConfig = emailConfig;
  }
  /**
   * Solicita reset de senha - cria token e envia email
   */
  async requestReset(email) {
    try {
      const user = await this.db.first(
        "SELECT id, email, full_name FROM profiles WHERE email = ?",
        [email.toLowerCase()]
      );
      if (!user) {
        console.log("\u26A0\uFE0F Email n\xE3o encontrado:", email);
        return { success: true };
      }
      await this.db.execute(
        "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE email = ? AND used_at IS NULL",
        [email.toLowerCase()]
      );
      const token = generateResetToken();
      const code = generateResetCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1e3).toISOString();
      await this.db.execute(
        `INSERT INTO password_reset_tokens (id, user_id, email, token, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), user.id, email.toLowerCase(), token, expiresAt]
      );
      const resetUrl = `${this.baseUrl}/reset-password?token=${token}`;
      console.log("");
      console.log("========================================");
      console.log("\u{1F510} RESET DE SENHA - LINK GERADO");
      console.log("========================================");
      console.log(`\u{1F4E7} Email: ${email}`);
      console.log(`\u{1F464} Nome: ${user.full_name || "Usu\xE1rio"}`);
      console.log(`\u{1F511} C\xF3digo: ${code}`);
      console.log(`\u{1F517} Link: ${resetUrl}`);
      console.log("========================================");
      console.log("");
      await this.sendResetEmail(email, user.full_name || "Usu\xE1rio", resetUrl, code);
      return { success: true, resetUrl };
    } catch (error) {
      console.error("Error requesting password reset:", error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Verifica se token é válido
   */
  async verifyToken(token) {
    try {
      const resetToken = await this.db.first(
        "SELECT id, email, expires_at, used_at FROM password_reset_tokens WHERE token = ?",
        [token]
      );
      if (!resetToken) {
        return { valid: false, error: "Token inv\xE1lido" };
      }
      if (resetToken.used_at) {
        return { valid: false, error: "Token j\xE1 foi utilizado" };
      }
      if (new Date(resetToken.expires_at) < /* @__PURE__ */ new Date()) {
        return { valid: false, error: "Token expirado" };
      }
      return { valid: true, email: resetToken.email };
    } catch (error) {
      console.error("Error verifying token:", error);
      return { valid: false, error: error.message };
    }
  }
  /**
   * Reseta a senha usando o token
   */
  async resetPassword(token, newPassword) {
    try {
      const verification = await this.verifyToken(token);
      if (!verification.valid) {
        return { success: false, error: verification.error };
      }
      const user = await this.db.first(
        "SELECT id FROM profiles WHERE email = ?",
        [verification.email]
      );
      if (!user) {
        return { success: false, error: "Usu\xE1rio n\xE3o encontrado" };
      }
      await this.db.execute(
        "UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?",
        [newPassword, (/* @__PURE__ */ new Date()).toISOString(), user.id]
      );
      await this.db.execute(
        "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?",
        [token]
      );
      return { success: true };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Envia email de reset de senha
   */
  async sendResetEmail(to, name, resetUrl, code) {
    const html = this.generateEmailHtml(name, resetUrl, code);
    const text = this.generateEmailText(name, resetUrl, code);
    if (this.emailConfig.RESEND_API_KEY) {
      try {
        await this.sendViaResend(to, "Redefinir sua senha - ACI", html, text);
        console.log("\u2705 Email enviado com sucesso via Resend");
        return;
      } catch (error) {
        console.error("\u26A0\uFE0F Falha ao enviar email via Resend:", error.message);
      }
    }
    try {
      await this.sendViaMailChannels(to, "Redefinir sua senha - ACI", html, text);
      console.log("\u2705 Email enviado com sucesso via MailChannels");
    } catch (error) {
      console.error("\u26A0\uFE0F Falha ao enviar email via MailChannels:", error.message);
      console.log("\u{1F4A1} Use o link do console para testar o reset de senha localmente");
    }
  }
  /**
   * Envia email usando Resend API
   */
  async sendViaResend(to, subject, html, text) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.emailConfig.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "ACI <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Resend API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    console.log("\u{1F4E7} Resend email ID:", data.id);
  }
  /**
   * Envia email usando MailChannels (gratuito para Cloudflare Workers)
   */
  async sendViaMailChannels(to, subject, html, text) {
    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }]
          }
        ],
        from: {
          email: this.emailConfig.SMTP_USERNAME || "noreply@aci.com",
          name: "ACI Automa\xE7\xF5es Comerciais"
        },
        subject,
        content: [
          {
            type: "text/plain",
            value: text
          },
          {
            type: "text/html",
            value: html
          }
        ]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MailChannels error: ${response.status} - ${errorText}`);
    }
  }
  /**
   * Gera HTML do email
   */
  generateEmailHtml(name, resetUrl, code) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - ACI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #6366f1;">
                ACI Automa\xE7\xF5es Comerciais
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
                Ol\xE1, ${name}!
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta. Se voc\xEA n\xE3o fez essa solicita\xE7\xE3o, ignore este email.
              </p>
              
              <!-- Code Box -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                  Seu c\xF3digo de verifica\xE7\xE3o:
                </p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #6366f1; letter-spacing: 4px;">
                  ${code}
                </p>
              </div>
              
              <p style="margin: 0 0 24px; font-size: 14px; color: #71717a; text-align: center;">
                Ou clique no bot\xE3o abaixo:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                  Redefinir Senha
                </a>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; text-align: center;">
                Este link expira em <strong>30 minutos</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                \xA9 2024 ACI Automa\xE7\xF5es Comerciais. Todos os direitos reservados.<br>
                Se voc\xEA n\xE3o solicitou esta redefini\xE7\xE3o, ignore este email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
  /**
   * Gera texto do email
   */
  generateEmailText(name, resetUrl, code) {
    return `
Ol\xE1, ${name}!

Recebemos uma solicita\xE7\xE3o para redefinir a senha da sua conta ACI.

Seu c\xF3digo de verifica\xE7\xE3o: ${code}

Ou acesse o link: ${resetUrl}

Este link expira em 30 minutos.

Se voc\xEA n\xE3o solicitou esta redefini\xE7\xE3o, ignore este email.

--
ACI Automa\xE7\xF5es Comerciais
    `.trim();
  }
};

// src/utils/http.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
__name(handleCORS, "handleCORS");
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");
function errorResponse(message, status = 500) {
  return jsonResponse(
    {
      success: false,
      error: message
    },
    status
  );
}
__name(errorResponse, "errorResponse");

// src/utils/userAgent.ts
function detectDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|opera mobi|iemobile|windows phone/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}
__name(detectDeviceType, "detectDeviceType");
function detectBrowser(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("opera") || ua.includes("opr/")) return "Opera";
  if (ua.includes("trident/") || ua.includes("msie")) return "IE";
  return "Unknown";
}
__name(detectBrowser, "detectBrowser");
function detectOS(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows nt 10")) return "Windows 10";
  if (ua.includes("windows nt 11") || ua.includes("windows nt 10") && ua.includes("win64")) return "Windows 11";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os x")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  return "Unknown";
}
__name(detectOS, "detectOS");

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return handleCORS();
    }
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const db = new D1Client(env.DB);
      const auth = new D1Auth(db);
      if (path === "/api/auth/signup" && request.method === "POST") {
        const { email, password, metadata } = await request.json();
        const result = await auth.signUp(email, password, metadata);
        return jsonResponse(result);
      }
      if (path === "/api/auth/login" && request.method === "POST") {
        const { email, password } = await request.json();
        const result = await auth.signIn(email, password);
        return jsonResponse(result);
      }
      if (path === "/api/auth/user" && request.method === "GET") {
        const userId = url.searchParams.get("id");
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const user = await auth.getUser(userId);
        return jsonResponse({ success: true, user });
      }
      if (path === "/api/auth/profile" && request.method === "PUT") {
        const { userId, ...data } = await request.json();
        const result = await auth.updateProfile(userId, data);
        return jsonResponse(result);
      }
      if (path === "/api/auth/forgot-password" && request.method === "POST") {
        const { email } = await request.json();
        if (!email) {
          return errorResponse("Email required", 400);
        }
        const passwordReset = new PasswordResetService(db, env.FRONTEND_URL || "http://localhost:3000", {
          SMTP_HOST: "smtp.gmail.com",
          SMTP_PORT: 587,
          SMTP_USERNAME: env.SMTP_USERNAME || "automacoescomerciais@gmail.com",
          SMTP_PASSWORD: env.SMTP_PASSWORD || "",
          SMTP_SENDER: "ACI Automa\xE7\xF5es Comerciais <automacoescomerciais@gmail.com>",
          RESEND_API_KEY: env.RESEND_API_KEY
        });
        const result = await passwordReset.requestReset(email);
        return jsonResponse(result);
      }
      if (path === "/api/auth/verify-reset-token" && request.method === "POST") {
        const { token } = await request.json();
        if (!token) {
          return errorResponse("Token required", 400);
        }
        const passwordReset = new PasswordResetService(db, env.FRONTEND_URL || "http://localhost:3000", {
          SMTP_HOST: "smtp.gmail.com",
          SMTP_PORT: 587,
          SMTP_USERNAME: env.SMTP_USERNAME || "",
          SMTP_PASSWORD: env.SMTP_PASSWORD || "",
          SMTP_SENDER: ""
        });
        const result = await passwordReset.verifyToken(token);
        return jsonResponse(result);
      }
      if (path === "/api/auth/reset-password" && request.method === "POST") {
        const { token, newPassword } = await request.json();
        if (!token || !newPassword) {
          return errorResponse("Token and new password required", 400);
        }
        if (newPassword.length < 6) {
          return errorResponse("Password must be at least 6 characters", 400);
        }
        const passwordReset = new PasswordResetService(db, env.FRONTEND_URL || "http://localhost:3000", {
          SMTP_HOST: "smtp.gmail.com",
          SMTP_PORT: 587,
          SMTP_USERNAME: env.SMTP_USERNAME || "",
          SMTP_PASSWORD: env.SMTP_PASSWORD || "",
          SMTP_SENDER: ""
        });
        const result = await passwordReset.resetPassword(token, newPassword);
        return jsonResponse(result);
      }
      if (path === "/api/credits/balance" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const credits = await db.first(
          "SELECT * FROM user_credits WHERE user_id = ?",
          [userId]
        );
        return jsonResponse({ success: true, credits });
      }
      if (path === "/api/credits/transactions" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const transactions = await db.query(
          "SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
          [userId]
        );
        return jsonResponse({ success: true, transactions });
      }
      if (path === "/api/packages" && request.method === "GET") {
        const packages = await db.query(
          "SELECT * FROM credit_packages WHERE is_active = 1 ORDER BY credits ASC"
        );
        return jsonResponse({ success: true, packages });
      }
      if (path === "/api/wordpress/connections" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const connections = await db.query(
          "SELECT * FROM wordpress_connections WHERE user_id = ? ORDER BY created_at DESC",
          [userId]
        );
        return jsonResponse({ success: true, connections });
      }
      if (path === "/api/wordpress/connection" && request.method === "POST") {
        const { userId, name, site_url, username, application_password } = await request.json();
        const id = crypto.randomUUID();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await db.execute(
          `INSERT INTO wordpress_connections (id, user_id, name, site_url, username, application_password, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, userId, name, site_url, username, application_password, now, now]
        );
        const connection = await db.first(
          "SELECT * FROM wordpress_connections WHERE id = ?",
          [id]
        );
        return jsonResponse({ success: true, connection });
      }
      if (path === "/api/keys" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const keys = await db.query(
          "SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC",
          [userId]
        );
        return jsonResponse({ success: true, keys });
      }
      if (path === "/api/keys" && request.method === "POST") {
        const { userId, service, key_name, api_key } = await request.json();
        const id = crypto.randomUUID();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await db.execute(
          `INSERT INTO api_keys (id, user_id, service, key_name, api_key, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, userId, service, key_name, api_key, now, now]
        );
        const key = await db.first(
          "SELECT * FROM api_keys WHERE id = ?",
          [id]
        );
        return jsonResponse({ success: true, key });
      }
      if (path === "/api/avatar/upload" && request.method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        const userId = formData.get("userId");
        if (!file || !userId) {
          return errorResponse("File and userId required", 400);
        }
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `avatars/${userId}/avatar.${fileExt}`;
        await env.STORAGE.put(fileName, file.stream(), {
          httpMetadata: {
            contentType: file.type
          }
        });
        const avatarUrl = `${env.R2_PUBLIC_URL}/aci-storage/${fileName}`;
        await db.execute(
          "UPDATE profiles SET avatar_url = ?, updated_at = ? WHERE id = ?",
          [avatarUrl, (/* @__PURE__ */ new Date()).toISOString(), userId]
        );
        return jsonResponse({
          success: true,
          avatarUrl,
          message: "Avatar uploaded successfully"
        });
      }
      if (path.startsWith("/api/avatar/") && request.method === "GET") {
        const pathParts = path.split("/");
        const userId = pathParts[3];
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const avatarKey = `avatars/${userId}/avatar.jpg`;
        const object = await env.STORAGE.get(avatarKey);
        if (!object) {
          const extensions = ["png", "webp", "gif"];
          for (const ext of extensions) {
            const altKey = `avatars/${userId}/avatar.${ext}`;
            const altObject = await env.STORAGE.get(altKey);
            if (altObject) {
              const headers2 = new Headers();
              altObject.writeHttpMetadata(headers2);
              headers2.set("etag", altObject.httpEtag);
              return new Response(altObject.body, { headers: headers2 });
            }
          }
          return errorResponse("Avatar not found", 404);
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        return new Response(object.body, { headers });
      }
      if (path === "/api/sessions" && request.method === "GET") {
        const userId = url.searchParams.get("userId");
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const sessions = await db.query(
          `SELECT * FROM user_sessions 
                     WHERE user_id = ? 
                     ORDER BY started_at DESC 
                     LIMIT 10`,
          [userId]
        );
        return jsonResponse({ success: true, sessions });
      }
      if (path === "/api/sessions" && request.method === "POST") {
        const { userId, userAgent, ipAddress } = await request.json();
        if (!userId) {
          return errorResponse("User ID required", 400);
        }
        const deviceType = detectDeviceType(userAgent || "");
        const browser = detectBrowser(userAgent || "");
        const os = detectOS(userAgent || "");
        const id = crypto.randomUUID();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        await db.execute(
          `INSERT INTO user_sessions 
                     (id, user_id, ip_address, user_agent, device_type, browser, os, started_at, last_activity_at, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [id, userId, ipAddress || null, userAgent || null, deviceType, browser, os, now, now]
        );
        const session = await db.first(
          "SELECT * FROM user_sessions WHERE id = ?",
          [id]
        );
        return jsonResponse({ success: true, session });
      }
      if (path === "/api/sessions/activity" && request.method === "PUT") {
        const { sessionId } = await request.json();
        if (!sessionId) {
          return errorResponse("Session ID required", 400);
        }
        await db.execute(
          "UPDATE user_sessions SET last_activity_at = ? WHERE id = ?",
          [(/* @__PURE__ */ new Date()).toISOString(), sessionId]
        );
        return jsonResponse({ success: true });
      }
      if (path === "/api/sessions/end" && request.method === "PUT") {
        const { sessionId } = await request.json();
        if (!sessionId) {
          return errorResponse("Session ID required", 400);
        }
        await db.execute(
          "UPDATE user_sessions SET ended_at = ?, is_active = 0 WHERE id = ?",
          [(/* @__PURE__ */ new Date()).toISOString(), sessionId]
        );
        return jsonResponse({ success: true });
      }
      if (path === "/api/health") {
        return jsonResponse({
          success: true,
          status: "healthy",
          environment: env.ENVIRONMENT,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          features: {
            d1: true,
            r2: !!env.STORAGE
          }
        });
      }
      return errorResponse("Not Found", 404);
    } catch (error) {
      console.error("Worker error:", error);
      return errorResponse(error.message || "Internal Server Error", 500);
    }
  }
};

// ../../Users/Pc/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../Users/Pc/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-i272ix/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../Users/Pc/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-i272ix/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map

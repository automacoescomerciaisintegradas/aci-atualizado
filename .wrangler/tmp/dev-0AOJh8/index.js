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

// .wrangler/tmp/bundle-gePCtG/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-gePCtG/middleware-loader.entry.ts
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

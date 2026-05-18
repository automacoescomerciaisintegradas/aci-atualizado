import fs from "fs";
import path from "path";

const DEFAULT_PATTERNS = [
  String.raw`rm\s+-rf\s+/`,
  String.raw`DROP\s+TABLE`,
  String.raw`DELETE\s+FROM`,
  String.raw`TRUNCATE\s+TABLE`,
  String.raw`chmod\s+777`,
  String.raw`curl.*\|\s*sh`,
  String.raw`wget.*\|\s*sh`,
];

const SECRET_PATTERNS = [
  String.raw`AIza[0-9A-Za-z-_]{35}`,
  String.raw`sk-[0-9A-Za-z]{48}`,
  String.raw`sk-ant-api03-[0-9A-Za-z-_]{93}`,
  String.raw`ghp_[0-9A-Za-z]{36}`,
];

function loadSettings(rootDir) {
  const settingsPath = path.join(rootDir, ".vscode", "settings.json");
  if (!fs.existsSync(settingsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch {
    return {};
  }
}

export class SecurityViolation extends Error {}

export class SecurityGuard {
  constructor(rootDir) {
    const settings = loadSettings(rootDir);
    this.enabled = settings["dangerousCommandBlocking.enabled"] ?? true;
    this.blockSecrets = settings["dangerousCommandBlocking.blockSecrets"] ?? true;
    const custom = settings["dangerousCommandBlocking.customPatterns"] ?? [];
    const allPatterns = [...DEFAULT_PATTERNS, ...(Array.isArray(custom) ? custom : [])];
    this.patterns = allPatterns.map((p) => new RegExp(p, "i"));
    this.secretPatterns = SECRET_PATTERNS.map((p) => new RegExp(p));
  }

  validate(command) {
    if (!this.enabled) return true;
    const normalized = String(command).trim().toLowerCase();

    for (const pattern of this.patterns) {
      if (pattern.test(normalized)) {
        throw new SecurityViolation(`Comando bloqueado por seguranca: ${pattern.source}`);
      }
    }

    if (this.blockSecrets) {
      for (const pattern of this.secretPatterns) {
        if (pattern.test(String(command))) {
          throw new SecurityViolation("Comando bloqueado: possivel vazamento de segredo detectado.");
        }
      }
    }

    return true;
  }
}


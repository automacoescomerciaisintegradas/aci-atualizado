import logging
import re
from datetime import datetime
from typing import Callable, Dict, List

try:
    from core.config_manager import get_config  # type: ignore
except Exception:
    def get_config() -> Dict[str, object]:
        return {}


logger = logging.getLogger(__name__)


class SecurityViolation(Exception):
    """Excecao levantada quando um comando viola as regras de seguranca."""


class SecurityGuard:
    """
    Sentinela de seguranca para validacao de comandos perigosos.
    Implementa o Protocolo de Defesa Preditiva.
    """

    DEFAULT_PATTERNS = [
        r"rm\s+-rf\s+/",
        r"DROP\s+TABLE",
        r"DELETE\s+FROM",
        r"TRUNCATE\s+TABLE",
        r"chmod\s+777",
        r"curl.*\|\s*sh",
        r"wget.*\|\s*sh",
    ]

    SECRET_PATTERNS = [
        r"AIza[0-9A-Za-z-_]{35}",
        r"sk-[0-9A-Za-z]{48}",
        r"sk-ant-api03-[0-9A-Za-z-_]{93}",
        r"ghp_[0-9A-Za-z]{36}",
    ]

    def __init__(self) -> None:
        self.refresh_config()

    def refresh_config(self) -> None:
        self.config = get_config()
        self.enabled = bool(self.config.get("dangerousCommandBlocking.enabled", True))
        self.block_secrets = bool(self.config.get("dangerousCommandBlocking.blockSecrets", True))
        self.patterns = self._compile_patterns()
        self.secret_regex = [re.compile(p) for p in self.SECRET_PATTERNS]

    def _compile_patterns(self) -> List[re.Pattern]:
        custom = self.config.get("dangerousCommandBlocking.customPatterns", [])
        custom_patterns = custom if isinstance(custom, list) else []
        all_patterns = self.DEFAULT_PATTERNS + custom_patterns

        compiled = []
        for pattern in all_patterns:
            try:
                compiled.append(re.compile(str(pattern), re.IGNORECASE))
            except re.error as exc:
                logger.warning("Regex invalida ignorada: %s | erro: %s", pattern, exc)
        return compiled

    def _normalize(self, command: str) -> str:
        return command.strip().lower()

    def _classify_severity(self, command: str) -> str:
        if any(token in command for token in ["rm -rf", "drop table", "truncate"]):
            return "CRITICO"
        if any(token in command for token in ["delete from", "chmod", "curl", "wget"]):
            return "ALTO"
        return "MEDIO"

    def _log_event(self, command: str, status: str, reason: str, severity: str) -> None:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "command": command,
            "status": status,
            "reason": reason,
            "severity": severity,
        }

        if status == "BLOCKED":
            logger.error("[SECURITY GUARD] BLOQUEADO: %s", log_entry)
        else:
            logger.info("[SECURITY GUARD] PERMITIDO: %s", log_entry)

    def validate(self, command: str, user: str = "unknown") -> bool:
        """
        Valida se um comando e seguro para execucao.

        Raises:
            SecurityViolation: Se o comando for perigoso ou contiver segredos.
        """
        _ = user
        if not self.enabled:
            return True

        normalized = self._normalize(command)

        for pattern in self.patterns:
            if pattern.search(normalized):
                severity = self._classify_severity(normalized)
                reason = f"Pattern match: {pattern.pattern}"
                self._log_event(command, "BLOCKED", reason, severity)
                raise SecurityViolation(f"[{severity}] Comando bloqueado por seguranca: {reason}")

        if self.block_secrets:
            for pattern in self.secret_regex:
                if pattern.search(command):
                    reason = "Deteccao de segredo/chave de API no comando"
                    self._log_event("[REDACTED COMMAND]", "BLOCKED", reason, "ALTO")
                    raise SecurityViolation(
                        "[ALTO] Comando bloqueado: Possivel vazamento de segredo detectado."
                    )

        self._log_event(command, "ALLOWED", "No threats detected", "BAIXO")
        return True

    def execute(self, command: str, executor_func: Callable[[str], object], user: str = "unknown"):
        """
        Wrapper para execucao segura de comandos.
        executor_func: funcao que executa o comando real.
        """
        try:
            self.validate(command, user=user)
            return executor_func(command)
        except SecurityViolation as exc:
            return {"status": "blocked", "error": str(exc)}
        except Exception as exc:
            logger.exception("Erro na execucao via Security Guard")
            return {"status": "error", "error": str(exc)}


security_guard = SecurityGuard()


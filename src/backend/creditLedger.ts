// creditLedger.ts – in‑memory credit management (placeholder)
// This module provides a very simple credit ledger used by the stub backend.
// In a production system this would be persisted in a database.

interface LedgerEntry {
    userId: string;
    balance: number;
}

// In‑memory map keyed by userId
const ledger: Record<string, LedgerEntry> = {};

/**
 * Ensure a ledger entry exists for a given user.
 */
function ensureUser(userId: string) {
    if (!ledger[userId]) {
        ledger[userId] = { userId, balance: 0 };
    }
}

/** Add credits to a user's balance */
export function addCredits(userId: string, amount: number): void {
    ensureUser(userId);
    ledger[userId].balance += amount;
}

/** Spend credits from a user's balance. Throws if insufficient */
export function spendCredits(userId: string, amount: number): void {
    ensureUser(userId);
    if (ledger[userId].balance < amount) {
        throw new Error("Insufficient credits");
    }
    ledger[userId].balance -= amount;
}

/** Get current balance for a user */
export function getBalance(userId: string): number {
    ensureUser(userId);
    return ledger[userId].balance;
}

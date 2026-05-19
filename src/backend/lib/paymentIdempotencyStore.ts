import fs from "fs";
import path from "path";

type PaymentRegistry = Record<string, string>;

const STORE_DIR = path.resolve(process.cwd(), "logs");
const STORE_FILE = path.join(STORE_DIR, "processed-payments.json");

class PaymentIdempotencyStore {
  private writeQueue: Promise<void> = Promise.resolve();

  private async ensureStoreFile() {
    await fs.promises.mkdir(STORE_DIR, { recursive: true });
    if (!fs.existsSync(STORE_FILE)) {
      await fs.promises.writeFile(STORE_FILE, JSON.stringify({}, null, 2), "utf-8");
    }
  }

  private async readRegistry(): Promise<PaymentRegistry> {
    await this.ensureStoreFile();
    const raw = await fs.promises.readFile(STORE_FILE, "utf-8");
    try {
      return JSON.parse(raw) as PaymentRegistry;
    } catch {
      return {};
    }
  }

  private async writeRegistry(registry: PaymentRegistry): Promise<void> {
    await this.ensureStoreFile();
    await fs.promises.writeFile(STORE_FILE, JSON.stringify(registry, null, 2), "utf-8");
  }

  async isProcessed(paymentId: string): Promise<boolean> {
    const registry = await this.readRegistry();
    return Boolean(registry[paymentId]);
  }

  async markProcessed(paymentId: string): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const registry = await this.readRegistry();
      registry[paymentId] = new Date().toISOString();
      await this.writeRegistry(registry);
    });
    await this.writeQueue;
  }
}

export const paymentIdempotencyStore = new PaymentIdempotencyStore();


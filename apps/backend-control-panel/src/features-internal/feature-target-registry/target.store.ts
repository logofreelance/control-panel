/**
 * target.store.ts
 *
 * Synchronous in-memory store for Target Systems registry.
 */

import { getTargets, createTarget, updateTarget, deleteTarget } from './shared/model';


class TargetStore {
  private targets: any[] = [];
  private isInitialized = false;

  async initialize(db: any) {
    if (this.isInitialized) return;
    try {
      console.log('[TARGET_STORE] Initializing from DB...');
      this.targets = await getTargets(db);
      this.isInitialized = true;
      console.log(`[TARGET_STORE] Loaded ${this.targets.length} systems.`);
    } catch (err) {
      console.error('[TARGET_STORE] Initialization failed:', err);
    }
  }

  /** Synchronous GET */
  getAll() {
    return [...this.targets];
  }

  getById(id: string) {
    return this.targets.find((t) => t.id === id);
  }

  /** Synchronous Actions with Background Persistence */

  add(db: any, newTarget: any) {
    // 1. Memory update
    this.targets.push(newTarget);

    // 2. Background DB update
    createTarget(db, newTarget).catch((err) => {
      console.error('[TARGET_STORE] Background CREATE failed:', err);
    });
    return true;
  }

  update(db: any, id: string, updates: any) {
    // 1. Memory update
    const index = this.targets.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.targets[index] = { ...this.targets[index], ...updates };

      // 2. Background DB update
      updateTarget(db, id, updates).catch((err) => {
        console.error('[TARGET_STORE] Background UPDATE failed:', err);
      });
      return true;
    }
    return false;
  }

  remove(db: any, id: string) {
    // 1. Memory update
    this.targets = this.targets.filter((t) => t.id !== id);

    // 2. Background DB update
    deleteTarget(db, id).catch((err) => {
      console.error('[TARGET_STORE] Background DELETE failed:', err);
    });
    return true;
  }
}

export const targetStore = new TargetStore();

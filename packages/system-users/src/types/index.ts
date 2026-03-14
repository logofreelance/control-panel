/**
 * packages/system-users/src/types/index.ts
 */

export * from '@modular/contracts';

// Legacy types if needed (re-aliasing)
// export type UserUpdateData = UpdateUserDTO;
// But cleaner to just use contracts.

import { UpdateUserDTO } from '@modular/contracts';
export type UserUpdateData = UpdateUserDTO;

/**
 * columns-get/types.ts
 *
 * Types ONLY for columns-get
 */

export interface PhysicalColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  default: any;
}

// services/logger.ts
import { db } from '@/db';
import { auditLogs } from '@/db/schema';

interface AuditLogParams {
  userId: number;
  action: string;
  tableName: string;
  recordId: number;
  oldValues?: any;
  newValues?: any;
}

export async function logAction({ userId, action, tableName, recordId, oldValues, newValues }: AuditLogParams) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      tableName,
      recordId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
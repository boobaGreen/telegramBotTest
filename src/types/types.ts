// types/types.ts

export interface GroupStats {
  totalMessages: number;
  totalSizeKB: number;
}

export interface ReportPayload {
  groupId: string;
  totalMessages: number;
  totalSizeKB: number;
  emissionsOneByteMethod: number;
  emissionsSWDMethod: number;
  groupName?: string;
  participantsCount?: number;
  adminNames: string[]; // Aggiunta di adminNames come array di stringhe
}

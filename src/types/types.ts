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
}

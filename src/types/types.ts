// types/types.ts

export interface GroupStats {
  totalMessages: number;
  totalSizeKB: number;
  textTotalMessages: number;
  textTotalSize: number;
  photoTotalMessages: number;
  photoTotalSize: number;
  videoTotalMessages: number;
  videoTotalSize: number;
  voiceTotalMessages: number;
  voiceTotalSize: number;
  documentTotalMessages: number;
  documentTotalSize: number;
  pollTotalMessages: number;
  pollTotalSize: number;
  stickerTotalMessages: number;
  stickerTotalSize: number;
}

export interface ReportPayload {
  groupId: string;
  totalMessages: number;
  totalSizeKB: number;
  emissionsOneByteMethod: number;
  emissionsSWDMethod: number;
  textTotalMessages: number;
  textTotalSize: number;
  textEmissionsOneByteMethod: number;
  textEmissionsSWDMethod: number;
  photoTotalMessages: number;
  photoTotalSize: number;
  photoEmissionsOneByteMethod: number;
  photoEmissionsSWDMethod: number;
  voiceTotalMessages: number;
  voiceTotalSize: number;
  voiceEmissionsOneByteMethod: number;
  voiceEmissionsSWDMethod: number;
  videoTotalMessages: number;
  videoTotalSize: number;
  videoEmissionsOneByteMethod: number;
  videoEmissionsSWDMethod: number;
  documentTotalMessages: number;
  documentTotalSize: number;
  documentEmissionsOneByteMethod: number;
  documentEmissionsSWDMethod: number;
  pollTotalMessages: number;
  pollTotalSize: number;
  pollEmissionsOneByteMethod: number;
  pollEmissionsSWDMethod: number;
  stickerTotalMessages: number;
  stickerTotalSize: number;
  stickerEmissionsOneByteMethod: number;
  stickerEmissionsSWDMethod: number;
  groupName?: string;
  participantsCount?: number;
  adminIds: number[]; // Aggiunta di adminIds come array di numbers
}

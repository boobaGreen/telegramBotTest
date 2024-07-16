// utils/reportUtils.ts
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
import axios from "axios";
import { GroupStats, ReportPayload } from "../types/types";

const { co2 } = require("@tgwf/co2");

const oneByte = new co2({ model: "1byte" });
const swd = new co2({ model: "swd" });

let endPoint = "http://localhost:3005";
if (process.env.ENVIRONMENT === "production") {
  endPoint = process.env.REPORT_ENDPOINT || "";
}
const finalEndPoint = endPoint + "/api/v1/reports";
const sendReportData = async (payload: ReportPayload) => {
  console.log("payload :", payload);
  try {
    const response = await axios.post(finalEndPoint, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Custom-Origin": "supersegretissimo",
      },
    });
    console.log(
      `Report inviato per il gruppo ${payload.groupId}:`,
      response.data
    );
  } catch (error) {
    console.error(
      `Errore durante l'invio del report per il gruppo ${payload.groupId}:`,
      error
    );
  }
};

const createReportPayload = (
  chatId: string,
  stats: GroupStats,
  groupName: string = "",
  participantsCount: number = 0,
  adminIds: number[] = []
): ReportPayload => {
  const totalSizeBytes = stats.totalSizeKB * 1024;
  const textTotalSizeBytes = stats.textTotalSize * 1024;
  const photoTotalSizeBytes = stats.photoTotalSize * 1024;
  const videoTotalSizeBytes = stats.videoTotalSize * 1024;
  const documentTotalSizeBytes = stats.documentTotalSize * 1024;
  const voiceTotalSizeBytes = stats.voiceTotalSize * 1024;
  const stickerTotalSizeBytes = stats.stickerTotalSize * 1024;

  const emissionsOneByte = oneByte
    .update(totalSizeBytes)
    .text(textTotalSizeBytes)
    .photo(photoTotalSizeBytes)
    .video(videoTotalSizeBytes)
    .voice(voiceTotalSizeBytes)
    .document(documentTotalSizeBytes)
    .sticker(stickerTotalSizeBytes);

  const emissionsSWD = swd
    .update(totalSizeBytes)
    .text(textTotalSizeBytes)
    .photo(photoTotalSizeBytes)
    .video(videoTotalSizeBytes)
    .voice(voiceTotalSizeBytes)
    .document(documentTotalSizeBytes)
    .sticker(stickerTotalSizeBytes);

  return {
    groupId: chatId,
    totalMessages: stats.totalMessages,
    totalSizeKB: stats.totalSizeKB,
    emissionsOneByteMethod: emissionsOneByte.toFixed(7),
    emissionsSWDMethod: emissionsSWD.toFixed(7),
    textTotalMessages: stats.textTotalMessages,
    textTotalSize: stats.textTotalSize,
    textEmissionsOneByteMethod: oneByte.text(textTotalSizeBytes).toFixed(7),
    textEmissionsSWDMethod: swd.text(textTotalSizeBytes).toFixed(7),
    photoTotalMessages: stats.photoTotalMessages,
    photoTotalSize: stats.photoTotalSize,
    photoEmissionsOneByteMethod: oneByte.photo(photoTotalSizeBytes).toFixed(7),
    photoEmissionsSWDMethod: swd.photo(photoTotalSizeBytes).toFixed(7),
    videoTotalMessages: stats.videoTotalMessages,
    videoTotalSize: stats.videoTotalSize,
    videoEmissionsOneByteMethod: oneByte.video(videoTotalSizeBytes).toFixed(7),
    videoEmissionsSWDMethod: swd.video(videoTotalSizeBytes).toFixed(7),
    voiceTotalMessages: stats.voiceTotalMessages,
    voiceTotalSize: stats.voiceTotalSize,
    voiceEmissionsOneByteMethod: oneByte.voice(voiceTotalSizeBytes).toFixed(7),
    voiceEmissionsSWDMethod: swd.voice(voiceTotalSizeBytes).toFixed(7),
    documentTotalMessages: stats.documentTotalMessages,
    documentTotalSize: stats.documentTotalSize,
    documentEmissionsOneByteMethod: oneByte
      .document(documentTotalSizeBytes)
      .toFixed(7),
    documentEmissionsSWDMethod: swd.document(documentTotalSizeBytes).toFixed(7),
    pollTotalMessages: stats.pollTotalMessages,
    pollTotalSize: stats.pollTotalSize,
    pollEmissionsOneByteMethod: oneByte
      .poll(stats.pollTotalSize * 1024)
      .toFixed(7),
    pollEmissionsSWDMethod: swd.poll(stats.pollTotalSize * 1024).toFixed(7),
    stickerTotalMessages: stats.stickerTotalMessages,
    stickerTotalSize: stats.stickerTotalSize,
    stickerEmissionsOneByteMethod: oneByte
      .sticker(stats.stickerTotalSize * 1024)
      .toFixed(7),
    stickerEmissionsSWDMethod: swd
      .sticker(stats.stickerTotalSize * 1024)
      .toFixed(7),
    groupName: groupName || "",
    participantsCount: participantsCount || 0,
    adminIds: adminIds,
  };
};

export const sendEmptyReport = async (chatId: string, chatInfo: any) => {
  const payload = createReportPayload(
    chatId,
    {
      totalMessages: 0,
      totalSizeKB: 0,
      textTotalMessages: 0,
      textTotalSize: 0,
      photoTotalMessages: 0,
      photoTotalSize: 0,
      videoTotalMessages: 0,
      videoTotalSize: 0,
      voiceTotalMessages: 0,
      voiceTotalSize: 0,
      documentTotalMessages: 0,
      documentTotalSize: 0,
      pollTotalMessages: 0,
      pollTotalSize: 0,
      stickerTotalMessages: 0,
      stickerTotalSize: 0,
    },
    chatInfo.title || "",
    chatInfo.membersCount || 0,
    []
  );
  console.log("payload poco prima di spedire vuoto", payload);
  await sendReportData(payload);
};

export const sendReport = async (
  groupStats: Record<string, GroupStats>,
  chatInfos: Record<string, any>
) => {
  console.log("groupstats in send report:", groupStats);
  console.log("chatInfo in send report", chatInfos);
  for (const chatId in groupStats) {
    console.log("chatId in send report:", chatId);
    console.log("groupStats in send report in: 2", groupStats);
    console.log("groupStats[chatId] in send report in 2:", groupStats[chatId]);

    const stats = groupStats[chatId];
    const chatInfo = chatInfos[chatId] || {};
    const payload = createReportPayload(
      chatId,
      stats,
      chatInfo.title || "",
      chatInfo.membersCount || 0,
      chatInfo.adminIds || []
    );
    console.log("payload poco prima di spedire *******", payload);
    await sendReportData(payload);
  }
};

import { z } from "zod"
import { Action, DataType, Message } from "../baseSpec.ts"

export const serviceName = "watch"

export const VideoItemData: DataType = z.object({
  videoId: z.string(),
  title: z.string(),
  channel: z.string(),
})
export const VideoIdData: DataType = z.object({ videoId: z.string() })
export const SyncData: DataType = z.object({
  time: z.number(),
  pause: z.boolean(),
})
export const QueueVideoData: DataType = z.object({ video: VideoItemData })
export const SearchVideoData: DataType = z.object({ query: z.string() })
export const RemoveVideoData: DataType = z.object({ index: z.number() })
export const GetStateData: DataType = z.unknown()
export const SearchResultsData: DataType = z.object({
  results: z.array(VideoItemData),
})
export const StateData: DataType = z.object({
  videoId: z.string(),
  playlist: z.array(VideoItemData),
  paused: z.boolean(),
  time: z.number(),
})

export const QueueVideoAction: Action = { action: "queue", data: QueueVideoData }
export const StartVideoAction: Action = { action: "start", data: VideoIdData }
export const SyncVideoAction: Action = { action: "sync", data: SyncData }
export const NextVideoAction: Action = { action: "next", data: VideoIdData }
export const SearchVideoAction: Action = { action: "search", data: SearchVideoData }
export const RemoveVideoAction: Action = { action: "remove", data: RemoveVideoData }
export const GetStateAction: Action = { action: "get-state", data: GetStateData }

export const RequestQueueEvent: Message = {
  event: "request-queue",
  data: QueueVideoData,
}
export const RequestStartEvent: Message = {
  event: "request-start",
  data: VideoIdData,
}
export const RequestSyncEvent: Message = {
  event: "request-sync",
  data: SyncData,
}
export const RequestRemoveEvent: Message = {
  event: "request-remove",
  data: RemoveVideoData,
}
export const SearchResultsEvent: Message = {
  event: "search-results",
  data: SearchResultsData,
}
export const StateEvent: Message = { event: "state", data: StateData }

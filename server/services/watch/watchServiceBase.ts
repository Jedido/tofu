/* eslint-disable */
// AUTO-GENERATED from server/specs/watchSpec.ts — do not edit.
// Run `npm run generate -- watch --force` to regenerate.
import { z } from "zod";
import type { TSocket } from "../../utils/tsocket.ts";
import GameService from "../gameService.ts";

export type { TSocket } from "../../utils/tsocket.ts";

const VideoItemData = z.object({
  videoId: z.string(),
  title: z.string(),
  channel: z.string(),
});

export type VideoItemData = z.infer<typeof VideoItemData>;

const VideoIdData = z.object({ videoId: z.string() });

export type VideoIdData = z.infer<typeof VideoIdData>;

const SyncData = z.object({
  time: z.number(),
  pause: z.boolean(),
});

export type SyncData = z.infer<typeof SyncData>;

const QueueVideoData = z.object({ video: VideoItemData });

export type QueueVideoData = z.infer<typeof QueueVideoData>;

const SearchVideoData = z.object({ query: z.string() });

export type SearchVideoData = z.infer<typeof SearchVideoData>;

const RemoveVideoData = z.object({ index: z.number() });

export type RemoveVideoData = z.infer<typeof RemoveVideoData>;

const GetStateData = z.unknown();

export type GetStateData = z.infer<typeof GetStateData>;

const SearchResultsData = z.object({
  results: z.array(VideoItemData),
});

export type SearchResultsData = z.infer<typeof SearchResultsData>;

const StateData = z.object({
  videoId: z.string(),
  playlist: z.array(VideoItemData),
  paused: z.boolean(),
  time: z.number(),
});

export type StateData = z.infer<typeof StateData>;

export abstract class WatchServiceBase extends GameService {
  constructor(roomId: string) {
    super(roomId)
    this.actions["watch-queue"] = (data, socket) => this.queueVideoAction(this.parseDataAs(QueueVideoData, data), socket)
    this.actions["watch-start"] = (data, socket) => this.startVideoAction(this.parseDataAs(VideoIdData, data), socket)
    this.actions["watch-sync"] = (data, socket) => this.syncVideoAction(this.parseDataAs(SyncData, data), socket)
    this.actions["watch-next"] = (data, socket) => this.nextVideoAction(this.parseDataAs(VideoIdData, data), socket)
    this.actions["watch-search"] = (data, socket) => this.searchVideoAction(this.parseDataAs(SearchVideoData, data), socket)
    this.actions["watch-remove"] = (data, socket) => this.removeVideoAction(this.parseDataAs(RemoveVideoData, data), socket)
    this.actions["watch-get-state"] = (data, socket) => this.getStateAction(this.parseDataAs(GetStateData, data), socket)
  }

  abstract queueVideoAction(data: QueueVideoData, sender: TSocket): void;

  abstract startVideoAction(data: VideoIdData, sender: TSocket): void;

  abstract syncVideoAction(data: SyncData, sender: TSocket): void;

  abstract nextVideoAction(data: VideoIdData, sender: TSocket): void;

  abstract searchVideoAction(data: SearchVideoData, sender: TSocket): void;

  abstract removeVideoAction(data: RemoveVideoData, sender: TSocket): void;

  abstract getStateAction(data: GetStateData, sender: TSocket): void;

  sendRequestQueue(data: QueueVideoData, recipient?: TSocket): void {
    this.send("watch-request-queue", data, recipient)
  }

  sendRequestStart(data: VideoIdData, recipient?: TSocket): void {
    this.send("watch-request-start", data, recipient)
  }

  sendRequestSync(data: SyncData, recipient?: TSocket): void {
    this.send("watch-request-sync", data, recipient)
  }

  sendRequestRemove(data: RemoveVideoData, recipient?: TSocket): void {
    this.send("watch-request-remove", data, recipient)
  }

  sendSearchResults(data: SearchResultsData, recipient?: TSocket): void {
    this.send("watch-search-results", data, recipient)
  }

  sendState(data: StateData, recipient?: TSocket): void {
    this.send("watch-state", data, recipient)
  }
}
WatchServiceBase.prototype.id = "watch"

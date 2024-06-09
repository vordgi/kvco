import { type IncomingMessage } from "http";
import { Configuration } from "./configuration";

export type QueueItem =
    | {
          type: "update";
          key: string;
          value: string;
      }
    | {
          type: "create";
          key: string;
      }
    | {
          type: "delete";
          key: string;
      };

export type Item = { [key: string]: Item } | string | undefined | null;

export type Values = { [key: string]: string | undefined | null };

export type Process = { target: Promise<void> | null; queue: QueueItem[] };

export type Processes = { [fileKey: string]: Process };

export type SegmentItem = {
    name: string;
    isDir: boolean;
    path: string;
    key?: string;
};

export type File = { path: string; key: string };
export type Files = File[];

export type InioRequest = IncomingMessage & { url: URL; config: Configuration };

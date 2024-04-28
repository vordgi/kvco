export type QueueItem =
    | {
          type: "update";
          term: string;
          value: string;
      }
    | {
          type: "create";
          term: string;
      }
    | {
          type: "delete";
          term: string;
      };

export type Item = { [key: string]: Item } | string | undefined | null;

export type Values = { [key: string]: string | undefined | null };

export type Process = { target: Promise<void> | null; queue: QueueItem[] };

export type Processes = { [locale: string]: Process };

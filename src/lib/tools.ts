import { type Item } from "./types";

export const isNested = (nestingItem: Item, segment: string): nestingItem is { [key: string]: Item } => {
    return Boolean(nestingItem && typeof nestingItem === "object" && nestingItem[segment]);
};

export const isObject = (nestingItem: Item): nestingItem is { [key: string]: Item } => {
    return Boolean(nestingItem && typeof nestingItem === "object");
};

export const isObjectKey = <T extends Record<string, unknown>>(
    key: string | number | symbol,
    object: T,
): key is keyof T => {
    return key in object;
};

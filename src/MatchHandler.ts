import { AnyToken } from "./Tokens";

export type MatchHandler = (index: number, tokens: AnyToken[]) => number;

export function insertLineBreak(offset: number): MatchHandler {
    return (i, tokens) => {
        tokens.splice(i + offset, 0, "\n");
        return 1;
    };
}

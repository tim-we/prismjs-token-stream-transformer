import { AnyToken, isObjectToken } from "./Tokens";

export type TokenMatcher = (token: AnyToken) => boolean;

export function not(matcher: TokenMatcher): TokenMatcher {
    return (token: AnyToken) => !matcher(token);
}

export function fromRegExp(re: RegExp): TokenMatcher {
    return (token: AnyToken) => typeof token === "string" && re.test(token);
}

export const hasLineBreak: TokenMatcher = fromRegExp(/.*(\n|\r).*/);

export const isMultiLineComment: TokenMatcher = (token: AnyToken) => {
    if (isObjectToken(token, "comment")) {
        return /.*(\n|\r).*/m.test(token.content);
    }

    return false;
};

export const anyToken: TokenMatcher = () => true;

export function isPunctuation(value: string): TokenMatcher {
    return (token) =>
        isObjectToken(token, "punctuation") && token.content === value;
}

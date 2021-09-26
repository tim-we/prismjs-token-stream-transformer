export type StringLiteral = string;

export type ObjectToken<T extends string> = {
    type: T;
    content: string;
    length: number;
};

export type AnyToken = StringLiteral | ObjectToken<string>;

export function isObjectToken<T extends string>(
    token: AnyToken,
    type: T
): token is ObjectToken<T> {
    if (typeof token === "string") {
        return false;
    }

    return token.type === type;
}

type CSSObjectToken =
    | ObjectToken<"comment">
    | ObjectToken<"punctuation">
    | ObjectToken<"selector">
    | ObjectToken<"property">
    | ObjectToken<"function">
    | ObjectToken<"string">
    | ObjectToken<"atrule">
    | ObjectToken<"url">;

export type CSSToken = StringLiteral | CSSObjectToken;

export type CSSTokenType = CSSObjectToken["type"];

type JSObjectToken =
    | ObjectToken<"comment">
    | ObjectToken<"punctuation">
    | ObjectToken<"keyword">
    | ObjectToken<"function">
    | ObjectToken<"parameter">
    | ObjectToken<"string">
    | ObjectToken<"operator">
    | ObjectToken<"class-name">
    | ObjectToken<"constant">
    | ObjectToken<"number">
    | ObjectToken<"template-string">;

export type JSToken = StringLiteral | JSObjectToken;

export type JSTokenType = JSObjectToken["type"];

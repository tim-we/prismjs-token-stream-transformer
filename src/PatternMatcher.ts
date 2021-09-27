import { MatchHandler } from "./MatchHandler";
import { TokenMatcher } from "./TokenMatcher";
import { AnyToken } from "./Tokens";

export default class PatternMatcher
    implements PatternBuilder, ApplicablePatternMatcher
{
    private readonly pattern: PatternNode;
    private lastNode: PatternNode;

    private constructor(startToken: TokenMatcher) {
        this.pattern = {
            tokenMatcher: startToken,
            next: undefined,
            handler: undefined,
        };

        this.lastNode = this.pattern;
    }

    public static when(matcher: TokenMatcher): PatternBuilder {
        return new PatternMatcher(matcher);
    }

    public followedBy(matcher: TokenMatcher): PatternBuilder {
        if (this.lastNode.handler) {
            throw new Error("Pattern already has a handler.");
        }
        this.lastNode.next = {
            tokenMatcher: matcher,
            next: undefined,
            handler: undefined,
        };
        this.lastNode = this.lastNode.next;
        return this;
    }

    public followedByMultiple(
        matcher: TokenMatcher,
        allowNone: boolean,
        greedy: boolean
    ): PatternBuilder {
        throw new Error("Not implemented.");
    }

    public then(handler: MatchHandler): ApplicablePatternMatcher {
        if (this.lastNode.handler) {
            throw new Error("Pattern already has a handler.");
        }
        this.lastNode.handler = handler;
        return this;
    }

    public applyTo(tokens: AnyToken[]): void {
        const partialMatches: PartialMatch[] = [];

        tokenLoop: for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            for (let j = 0; j < partialMatches.length; j++) {
                const partialMatch = partialMatches[j];
                const next = partialMatch.nextNode;
                if (next.tokenMatcher(token)) {
                    if (next.handler) {
                        // match, apply handler
                        const resetIndex = next.handler(
                            partialMatch.startIndex,
                            tokens
                        );
                        partialMatches.length = 0;
                        if (resetIndex) {
                            i = partialMatch.startIndex - 1;
                        }
                        continue tokenLoop;
                    }
                    if (next.next) {
                        // advance partial match
                        partialMatch.nextNode = next.next;
                    }
                    throw new Error("Illegal state");
                } else {
                    // remove partial match
                    partialMatches.splice(j, 1);
                }
            }

            if (this.pattern.tokenMatcher(token)) {
                if (this.pattern.handler) {
                    // match, apply handler
                    const resetIndex = this.pattern.handler(i, tokens);
                    if (resetIndex) {
                        i--;
                    }
                    continue tokenLoop;
                }
                if (this.pattern.next) {
                    // add new partial match
                    partialMatches.push({
                        nextNode: this.pattern.next,
                        startIndex: i,
                    });
                }
            }
        }
    }
}

type PatternNode = {
    tokenMatcher: TokenMatcher;
    next?: PatternNode;
    handler?: MatchHandler;
};

export interface PatternBuilder {
    followedBy: (matcher: TokenMatcher) => PatternBuilder;
    then: (handler: MatchHandler) => ApplicablePatternMatcher;
}

export interface ApplicablePatternMatcher {
    applyTo: (tokens: AnyToken[]) => void;
}

type PartialMatch = {
    startIndex: number;
    nextNode: PatternNode;
};

import { MatchHandler } from "./MatchHandler";
import { TokenMatcher } from "./TokenMatcher";
import { AnyToken } from "./Tokens";

export default class PatternMatcher {
    private patternTrees: PatternTreeNode[] = [];

    private PatternBuilderImpl = class PatternBuilderImpl {
        private node: PatternTreeNode;

        constructor(node: PatternTreeNode) {
            this.node = node;
        }

        public followedBy(matcher: TokenMatcher): PatternBuilder {
            const node = findOrCreateNode(matcher, this.node.next);
            return new PatternBuilderImpl(node);
        }

        public then(handler: MatchHandler): void {
            if (this.node.handler) {
                throw new Error("Pattern already has a handler.");
            }
            this.node.handler = handler;
        }
    };

    public when(matcher: TokenMatcher): PatternBuilder {
        const node = findOrCreateNode(matcher, this.patternTrees);
        return new this.PatternBuilderImpl(node);
    }

    private findMatches(tokens: AnyToken[]): MatchInfo[] {
        if (this.patternTrees.length === 0) {
            console.warn("No patterns defined.");
            return [];
        }

        let partialMatches: PartialMatch[] = [];
        const matches: MatchInfo[] = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // prioritize partial matches
            partialMatches = partialMatches
                .filter((pm) => pm.nextNode.tokenMatcher(token))
                .flatMap((pm) => {
                    const nextNode = pm.nextNode;

                    if (nextNode.handler) {
                        // found a match!
                        matches.push({
                            startIndex: pm.startIndex,
                            handler: nextNode.handler,
                        });
                    }

                    return nextNode.next.map((n) => ({
                        startIndex: pm.startIndex,
                        nextNode: n,
                    }));
                });

            // look for new matches
            for (const node of this.patternTrees) {
                if (node.tokenMatcher(token)) {
                    if (node.handler) {
                        // found a match!
                        matches.push({
                            startIndex: i,
                            handler: node.handler,
                        });
                    }

                    node.next.forEach((n) =>
                        partialMatches.push({
                            startIndex: i,
                            nextNode: n,
                        })
                    );
                }
            }
        }

        return matches;
    }

    public findAndHandleMatches(tokens: AnyToken[]): void {
        const matches = this.findMatches(tokens);

        
        let offset = 0; // TODO
        for(const match of matches) {
            offset += match.handler(match.startIndex + offset, tokens);
        }
    }
}

function findOrCreateNode(
    matcher: TokenMatcher,
    nodes: PatternTreeNode[]
): PatternTreeNode {
    let node = nodes.find((node) => node.tokenMatcher === matcher);

    if (node) {
        return node;
    }

    node = {
        tokenMatcher: matcher,
        next: [],
    };

    nodes.push(node);

    return node;
}

type PatternTreeNode = {
    tokenMatcher: TokenMatcher;
    next: PatternTreeNode[];
    handler?: MatchHandler;
};

interface PatternBuilder {
    followedBy: (matcher: TokenMatcher) => PatternBuilder;
    then: (handler: MatchHandler) => void;
}

type PartialMatch = {
    startIndex: number;
    nextNode: PatternTreeNode;
};

type MatchInfo = {
    startIndex: number;
    handler: MatchHandler;
};

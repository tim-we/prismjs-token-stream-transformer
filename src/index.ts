import { insertLineBreak } from "./MatchHandler";
import PatternMatcher from "./PatternMatcher";
import {
    hasLineBreak,
    isMultiLineComment,
    isPunctuation,
    not,
} from "./TokenMatcher";

export const cssFormatter = new PatternMatcher();
cssFormatter
    .when(isMultiLineComment)
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

cssFormatter
    .when(isPunctuation("}"))
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

cssFormatter
    .when(isPunctuation(";"))
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

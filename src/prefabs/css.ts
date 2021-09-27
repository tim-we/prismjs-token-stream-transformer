import PatternMatcher from "../PatternMatcher";
import { insertLineBreak } from "../MatchHandler";
import { ApplicablePatternMatcher } from "../PatternMatcher";
import {
    hasLineBreak,
    isMultiLineComment,
    isPunctuation,
    not,
} from "../TokenMatcher";

export const cssBreakAfterComment = PatternMatcher.when(isMultiLineComment)
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

export const cssBreakAfterBlockStart = PatternMatcher.when(isPunctuation("{"))
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

export const cssBreakAfterBlockEnd = PatternMatcher.when(isPunctuation("}"))
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

export const cssBreakBeforeBlockEnd = PatternMatcher.when(not(hasLineBreak))
    .followedBy(isPunctuation("}"))
    .then(insertLineBreak(1));

export const cssBreakAfterProperty = PatternMatcher.when(isPunctuation(";"))
    .followedBy(not(hasLineBreak))
    .then(insertLineBreak(1));

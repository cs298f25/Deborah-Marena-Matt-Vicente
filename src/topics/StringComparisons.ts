import { Question, Subtopic, Topic, createQuestion } from "../topics";
import { randChoice, randChoices, randIntNum, shuffle, STRINGS, capitalize } from "../util";
import { toPyStr } from "../python";
import { BASIC_RELATIONAL_OPERATORS } from "./BasicRelationalOperators";
import { MEMBERSHIP_OPERATORS } from "./MembershipOperator";

export class StringEqualsFalse extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`${toPyStr(a)} == ${toPyStr(b)}`, [true, false]);
  }
}

export class StringEqualsTrue extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    return createQuestion(`"${a}" == '${a}'`, [true, false]);
  }
}

export class StringEqualsCapitalized extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    return createQuestion(`"${a}" == '${capitalize(a)}'`, [true, false]);
  }
}

export class StringLessThanFalse extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randChoices(STRINGS, 2);
    while (a <= b) { [a, b] = randChoices(STRINGS, 2); }
    return createQuestion(`${toPyStr(a)} < ${toPyStr(b)}`, [true, false]);
  }
}

export class StringLessThanTrue extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randChoices(STRINGS, 2);
    while (a >= b) { [a, b] = randChoices(STRINGS, 2); }
    return createQuestion(`${toPyStr(a)} < ${toPyStr(b)}`, [true, false]);
  }
}

export class StringLessThanLonger extends Subtopic {
  generateQuestion(): Question {
    let a = randChoice(STRINGS);
    return createQuestion(`${toPyStr(a)} <= ${toPyStr(a + 's')}`, [true, false]);
  }
}

export class StringLessThanCapitalized extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    return createQuestion(`${toPyStr(a)} < ${toPyStr(capitalize(a))}`, [true, false]);
  }
}

export class StringLessThanOtherCaps extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randChoices(STRINGS, 2);
    while (a >= b) { [a, b] = randChoices(STRINGS, 2); }
    return createQuestion(`${toPyStr(a)} < ${toPyStr(capitalize(b))}`, [true, false]);
  }
}

export class StringLessThanBothCapsTrue extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randChoices(STRINGS, 2);
    while (a >= b) { [a, b] = randChoices(STRINGS, 2); }
    return createQuestion(`${toPyStr(capitalize(a))} < ${toPyStr(capitalize(b))}`, [true, false]);
  }
}

export class StringLessThanBothCapsFalse extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randChoices(STRINGS, 2);
    while (a <= b) { [a, b] = randChoices(STRINGS, 2); }
    return createQuestion(`${toPyStr(capitalize(a))} < ${toPyStr(capitalize(b))}`, [true, false]);
  }
}

export class StringLessThanOtherCapsTrue extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randChoices(STRINGS, 2);
    while (a >= b) { [a, b] = randChoices(STRINGS, 2); }
    return createQuestion(`${toPyStr(a)} < ${toPyStr(capitalize(b))}`, [true, false]);
  }
}

export class StringCharMembershipTrue extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const b = randChoice([...a]);
    return createQuestion(`${toPyStr(b)} in ${toPyStr(a)}`, [true, false]);
  }
}

export class StringCharMembershipFalse extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const b = randChoice([...a]);
    return createQuestion(`${toPyStr(capitalize(b))} in ${toPyStr(a)}`, [true, false]);
  }
}

export class StringMembershipTrue extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const i = randIntNum(0, a.length - 3);
    const b = a.slice(i, i + 3);
    return createQuestion(`${toPyStr(b)} in ${toPyStr(a)}`, [true, false]);
  }
}

export class StringMembershipFalse extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const i = randIntNum(0, a.length - 3);
    let b = a.slice(i, i + 3);
    while (a.includes(b)) { b = shuffle(b.split('')).join(''); }
    return createQuestion(`${toPyStr(b)} in ${toPyStr(a)}`, [true, false]);
  }
}

export const STRING_COMPARISONS: Topic = new Topic('string-comparisons', 'String Comparisons', [
  new StringEqualsFalse(),
  new StringEqualsTrue(),
  new StringEqualsCapitalized(),
  new StringLessThanFalse(),
  new StringLessThanTrue(),
  new StringLessThanLonger(),
  new StringLessThanCapitalized(),
  new StringLessThanOtherCapsTrue(),
  new StringLessThanBothCapsTrue(),
  new StringLessThanBothCapsFalse(),
  new StringMembershipTrue(),
  new StringMembershipFalse(),
  new StringCharMembershipTrue(),
  new StringCharMembershipFalse(),
], [BASIC_RELATIONAL_OPERATORS, MEMBERSHIP_OPERATORS]);

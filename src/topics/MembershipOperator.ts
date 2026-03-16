import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randVariable, randChoice, STRINGS, randIntNum, randChoices, range, maybeNot } from '../util';
import { toPyStr, toPyAtom } from '../python';
import { BASIC_ARITHMETIC } from './BasicArithmetic';

function randList(): (string | bigint)[] { return randChoices([...STRINGS, ...range(1n, 10n)], randIntNum(4, 8)); }
export function randListAndString(): [(string | bigint)[], string] {
  let a = randList();
  let item = randChoice(a);
  while (typeof item !== 'string') {
    a = randList();
    item = randChoice(a);
  }
  return [a, item];
}

export class CharInString extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoice(STRINGS);
    const char = randChoice([...a]);
    return createQuestion(`
      ${x} = ${toPyStr(a)}
      ${toPyStr(char)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class CapitalCharInString extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoice(STRINGS);
    const char = randChoice([...a]).toUpperCase();
    return createQuestion(`
      ${x} = ${toPyStr(a)}
      ${toPyStr(char)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class SubstringInString extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoice(STRINGS);
    const i = randIntNum(0, a.length - 3);
    const sub = a.slice(i, i + 2);
    return createQuestion(`
      ${x} = ${toPyStr(a)}
      ${toPyStr(sub)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class SubstringNotInString extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoice(STRINGS);
    let [char1, char2] = randChoices([...a], 2);
    while (char1 === char2 || a.includes(char1 + char2)) {
      [char1, char2] = randChoices([...a], 2);
    }
    const sub = char1 + char2;
    return createQuestion(`
      ${x} = ${toPyStr(a)}
      ${toPyStr(sub)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class StringInSubstring extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const i = randIntNum(1, a.length - 3);
    const j = randIntNum(i + 2, a.length - 1);
    const sub = a.slice(i, j);
    return createQuestion(`${toPyStr(a)} ${maybeNot()}in ${toPyStr(sub)}`, [true, false]);
  }
}

export class ItemInList extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    let a = randList();
    let item = randChoice(a);
    while (typeof item !== 'number' && typeof item !== 'bigint') {
      a = randList();
      item = randChoice(a);
    }
    return createQuestion(`
      ${x} = ${toPyAtom(a)}
      ${toPyAtom(item)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class ItemNotInList extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    let a = randList();
    let item = randChoice(randList());
    while (a.includes(item) || typeof item !== 'number' && typeof item !== 'bigint') {
      a = randList();
      item = randChoice(randList());
    }
    return createQuestion(`
      ${x} = ${toPyAtom(a)}
      ${toPyAtom(item)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class StringInList extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    let [a, item] = randListAndString();
    return createQuestion(`
      ${x} = ${toPyAtom(a)}
      ${toPyAtom(item)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class StringNotInList extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    let [a, item] = randListAndString();
    item = item[0].toUpperCase() + item.slice(1);
    return createQuestion(`
      ${x} = ${toPyAtom(a)}
      ${toPyAtom(item)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class CharNotInList extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, item] = randListAndString();
    const char = item[0];
    return createQuestion(`
      ${x} = ${toPyAtom(a)}
      ${toPyAtom(char)} ${maybeNot()}in ${x}`, [true, false]);
  }
}

export class MembershipBackwards extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoices([...range(1n, 10n)], randIntNum(4, 8));
    const item = randChoice(a);
    return createQuestion(`
      ${x} = ${toPyAtom(a)}
      ${x} in ${toPyAtom(item)}`, [true, false]);
  }
}


export const MEMBERSHIP_OPERATORS = new Topic('membership-operators', 'Membership Operators', [
  new CharInString(),
  new CapitalCharInString(),
  new SubstringInString(),
  new SubstringNotInString(),
  new StringInSubstring(),
  new ItemInList(),
  new ItemNotInList(),
  new StringInList(),
  new StringNotInList(),
  new CharNotInList(),
  new MembershipBackwards(),
], [BASIC_ARITHMETIC]);

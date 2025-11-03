import { Question, Subtopic, Topic, createQuestion } from "../topics";
import { randChoice, randChoices, randIntNum, randInts, randVariable, randVars, STRINGS } from "../util";
import { toPyStr } from "../python";
import { BASIC_ARITHMETIC } from "./BasicArithmetic";
import { BASIC_VARIABLES } from "./BasicVariables";
import { STRING_CONCAT } from "./StringConcat";
import { STRING_LENGTH } from "./StringLength";

const PHRASES = [
  "Quick brown fox jumps over the lazy dog.",
  "There's a JERTAIN in the CURTAIN.",
  "I talk to the ZELF up on the SHELF.",
  "There's a NINK in the SINK.",
  "That YOTTLE In the BOTTLE!",
  "I like the ZABLE on the TABLE.",
  "But the BOFA on the SOFA...",
];

export class StringSplit extends Subtopic {
  generateQuestion(): Question {
    const s = randChoice(PHRASES);
    return createQuestion(`
      s = ${toPyStr(s)}
      s.split()`, [s.split(' ').join(''), s.split(' ').join(',')]);
  }
}

export class StringSplitLen extends Subtopic {
  generateQuestion(): Question {
    const s = randChoice(PHRASES);
    const n = BigInt(s.split(' ').length);
    return createQuestion(`
      s = ${toPyStr(s)}
      len(s.split())`,
      [BigInt(s.split(' ').join('').length), BigInt(s.split(' ').join(',').length), BigInt(s.length), n, n-1n, n+1n]
    );
  }
}

export class StringSplitChar extends Subtopic {
  generateQuestion(): Question {
    let s = randChoice(PHRASES);
    let c = randChoice([...s]);
    while (c === ' ' || s.split(c).length <= 3) {
      s = randChoice(PHRASES);
      c = randChoice([...s]);
    }
    return createQuestion(`
      s = ${toPyStr(s)}
      s.split('${c}')`, [s.split(c).join(''), s.split(c).join(','), c]);
  }
}

export class StringSplitCharLen extends Subtopic {
  generateQuestion(): Question {
    let s = randChoice(PHRASES);
    let c = randChoice([...s]);
    let n = s.split(c).length;
    while (c === ' ' || n <= 3) {
      s = randChoice(PHRASES);
      c = randChoice([...s]);
      n = s.split(c).length;
    }
    return createQuestion(`
      s = ${toPyStr(s)}
      len(s.split('${c}'))`,
      [BigInt(s.length), BigInt(s.split(c).join('').length), BigInt(n), BigInt(n-1), BigInt(n+1)]
    );
  }
}

export class StringSplitVars extends Subtopic {
  generateQuestion(): Question {
    const [x, y] = randVars(2);
    const [a, b] = randInts(1n, 9n, 2);
    const str = `${a},${b}`;
    return createQuestion(`
      ${x}, ${y} = ${toPyStr(str)}.split(',')
      ${x} + ${y}`,
      [a+b, a, b, str, `${a}${b}`, `${b}${a}`, `${x}${y}`, `${y}${x}`]
    );
  }
}

const SYMBOLS = ['-', ',', '~', '_', '+'];

export class StringJoinList extends Subtopic {
  generateQuestion(): Question {
    const sym = randChoice(SYMBOLS);
    const strs = randChoices(STRINGS, randIntNum(3, 5));
    const quoted = strs.map(s => `"${s}"`);
    const list = "[" + quoted.join(', ') + "]";
    return createQuestion(`${toPyStr(sym)}.join(${list})`, [strs.join(sym), strs.join(''), strs, quoted.join(sym), quoted.join(''), quoted]);
  }
}

export class StringJoinStr extends Subtopic {
  generateQuestion(): Question {
    const sym = randChoice(SYMBOLS);
    const str = randChoice(STRINGS);
    const chars = [...str];
    return createQuestion(`${toPyStr(sym)}.join(${toPyStr(str)})`, [chars.join(sym), chars.join(''), chars]);
  }
}

export class StringSplitJoin extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const s = randChoice(PHRASES);
    return createQuestion(`
      ${x} = ${toPyStr(s)}
      ${toPyStr('')}.join(${x}.split())`,
      [s.split('').join(''), s.split(' ').join(','), s, s.split(' ')]);
  }
}

export class StringSplitJoinSym extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const s = randChoice(PHRASES);
    const sym = randChoice(SYMBOLS);
    return createQuestion(`
      ${x} = ${toPyStr(s)}
      ${toPyStr(sym)}.join(${x}.split())`, [s.split('').join(sym), s.split(' ').join(sym), s, s.split(' ')]);
  }
}

export const SPLITTING_AND_JOINING: Topic = new Topic('splitting-and-joining', 'Splitting and Joining', [
  new StringSplit(),
  new StringSplitLen(),
  new StringSplitChar(),
  new StringSplitCharLen(),
  new StringSplitVars(),
  new StringJoinList(),
  new StringJoinStr(),
  new StringSplitJoin(),
  new StringSplitJoinSym(),
], [BASIC_ARITHMETIC, BASIC_VARIABLES, STRING_CONCAT, STRING_LENGTH]);

import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randChoice, randChoices, randBool, randVars, randInt, randInts, randIntNum, shuffle, capitalize, ASCII_LETTERS, DIGITS } from '../util';
import { toPyStr, toPyAtom } from '../python';
import dedent from 'dedent-js';
import { BASIC_ARITHMETIC } from './BasicArithmetic';
import { BASIC_VARIABLES } from './BasicVariables';
import { STRING_INDEX } from './StringIndexing';
import { STRING_LENGTH } from './StringLength';
import { BASIC_PRINTS } from './BasicPrints';
import { MEMBERSHIP_OPERATORS } from './MembershipOperator';
import { STRING_SLICING } from './StringSlicing';
import { STRING_CONCAT } from './StringConcat';
import { STRING_METHODS } from './StringMethods';
import { SPLITTING_AND_JOINING } from './SplittingAndJoining';
import { F_STRINGS } from './FStrings';

const STRINGS = ["Hello World", "Moravian Univ", "The String", "Intro CS"]
const ANIMALS = ["cat", "dog", "vee", "fox", "bat", "cow", "pig", "rat", "eel", "ant", "hen"]

function createVarsVals(): [string[], [bigint, bigint, string], {start: bigint, stop: bigint, word: string, char: string}] {
  const [var1, var2, var3] = randVars(3);
  const str = randChoice(STRINGS);
  const word = randChoice(ANIMALS);
  const char = randChoice(ASCII_LETTERS);
  const int1 = randInt(1n, 3n);
  let [start, stop] = randInts(2n, BigInt(str.length - 2), 2);
  if (start > stop) { [start, stop] = [stop, start]; }
  const int2 = stop;
  return [[var1, var2, var3], [int1, int2, str], {start, stop, word, char}];
}
function createCode(vars: string[], vals: [bigint, bigint, string]): string {
  const [var1, var2, var3] = vars;
  const [int1, int2, str] = vals;
  return dedent`
    ${var1} = ${int1}
    ${var2} = ${int2}
    ${var3} = ${toPyStr(str)}
  `;
}

class StringsMastery extends Topic {
  vars: string[];
  vals: [bigint, bigint, string];
  values: {start: bigint, stop: bigint, word: string, char: string};
  constructor() {
    const [vars, vals, values] = createVarsVals();
    const code = createCode(vars, vals);
    super('strings-mastery', 'Strings Mastery', [
      new StringsMastery_1(vars, vals, values, code),
      new StringsMastery_2(vars, vals, values, code),
      new StringsMastery_3(vars, vals, values, code),
      new StringsMastery_4(vars, vals, values, code),
      new StringsMastery_5(vars, vals, values, code),
      new StringsMastery_6(vars, vals, values, code),
      new StringsMastery_7(vars, vals, values, code),
      new StringsMastery_8(vars, vals, values, code),
      new StringsMastery_9(vars, vals, values, code),
      new StringsMastery_10(vars, vals, values, code),
      new StringsMastery_Long_1(),
      new StringsMastery_Long_2(),
    ], [
        BASIC_ARITHMETIC, BASIC_VARIABLES, BASIC_PRINTS, STRING_LENGTH, STRING_CONCAT, STRING_INDEX,
        STRING_SLICING, MEMBERSHIP_OPERATORS, STRING_METHODS, SPLITTING_AND_JOINING, F_STRINGS,
    ], {order: 'sequential', sharedCode: code, forceQuiz: true});
    this.vars = vars;
    this.vals = vals;
    this.values = values;
  }

  start(): void {
    const [vars, vals, values] = createVarsVals();
    this.vars.splice(0, this.vars.length, ...vars);
    this.vals.splice(0, this.vals.length, ...vals);
    this.values.start = values.start;
    this.values.stop = values.stop;
    this.values.word = values.word;
    this.values.char = values.char;
    this.sharedCode = createCode(vars, vals);
    for (const subtopic of this.subtopics) {
      if (subtopic instanceof StringsMasteryBase) {
        subtopic.sharedCode = this.sharedCode;
      }
    }
  }
}

abstract class StringsMasteryBase extends Subtopic {
  vars: string[];
  vals: [bigint, bigint, string];
  values: {start: bigint, stop: bigint, word: string, char: string};
  sharedCode: string;
  constructor(vars: string[], vals: [bigint, bigint, string], values: {start: bigint, stop: bigint, word: string, char: string}, sharedCode: string) {
    super(); this.vars = vars; this.vals = vals; this.values = values; this.sharedCode = sharedCode;
  }
  generateQuestion(): Question {
    const code = this.genCode();
    return createQuestion(code, [], {sharedCode: this.sharedCode});
  }
  abstract genCode(): string
}

class StringsMastery_1 extends StringsMasteryBase {
  genCode(): string { return `len(${this.vars[2]})`; }
}
class StringsMastery_2 extends StringsMasteryBase {
  genCode(): string { return `${this.vars[2]}[-1]`; }
}
class StringsMastery_3 extends StringsMasteryBase {
  genCode(): string { return `${this.vars[2]}[${this.vars[0]}]`; }
}
class StringsMastery_4 extends StringsMasteryBase {
  genCode(): string { return `${this.vars[2]}[${this.values.start}:${this.vars[1]}]`; }
}
class StringsMastery_5 extends StringsMasteryBase {
  genCode(): string { return `${this.vars[2]}[:${this.values.start}] + ${this.vars[2]}[${this.vars[1]}:]`; }
}
class StringsMastery_6 extends StringsMasteryBase {
  genCode(): string { return `${toPyStr(this.values.char)} ${randChoice(["not ", ""])}in ${this.vars[2]}`; }
}
class StringsMastery_7 extends StringsMasteryBase {
  genCode(): string { return `${toPyStr(randChoice(ASCII_LETTERS))} < ${toPyStr(randChoice(ASCII_LETTERS))}`; }
}
class StringsMastery_8 extends StringsMasteryBase {
  genCode(): string { return randBool() ? `${this.vars[2]}.lower()` : `${this.vars[2]}.upper()`; }
}
class StringsMastery_9 extends StringsMasteryBase {
  genCode(): string { return randBool() ? `f'${this.values.word} {${this.vars[0]}+${this.vars[1]}}'` : `f'${this.values.word} {${this.vars[0]}}+{${this.vars[1]}}'`; }
}
class StringsMastery_10 extends StringsMasteryBase {
  genCode(): string { return `${toPyStr(randChoices([...DIGITS, "a"], 3).join(""))}.isdigit()`; }
}

class StringsMastery_Long_1 extends Subtopic {
  generateQuestion(): Question {
    const sep = randChoice([...";:-_."]);
    const [var1, var2, var3] = randVars(3);
    const list_val = randChoices(ANIMALS, randIntNum(2, 3));
    const sliced = randChoice([
        `${var1}[:${var2}]`,
        `${var1}[:${var2}+1]`,
        `${var1}[${var2}:]`,
        `${var1}[${var2}+1:]`,
    ]);
    const quote = randChoice(['"', "'"]);
    const code = dedent`
        ${var3} = ${toPyAtom(list_val)}
        ${var1} = ${toPyStr(sep)}.join(${var3})
        ${var2} = ${var1}.find(${toPyStr(sep)})
        print(f\"{len(${var1})} {${var2}} \\${quote}{${sliced}}\\${quote}\")
    `;
    return createQuestion(code, [], {usesOutput: true});
  }
}

class StringsMastery_Long_2 extends Subtopic {
  generateQuestion(): Question {
    const sep1 = randChoice([",", ":", ";"]);
    const sep2 = randChoice([",", ":", ";"]);
    const [var1, var2, var3] = randVars(3);
    const animals = ANIMALS.map(animal => capitalize(animal));
    shuffle(animals);
    const count1 = randIntNum(2, 4);
    const count2 = randIntNum(2, 3);
    const val1 = animals.slice(0, count1).join(sep1);
    const val2 = animals.slice(count1, count1+count2).join(sep2);
    const [var_x, sep_x, var_y] = randBool() ? [var1, sep1, var2] : [var2, sep2, var1];
    const ch1 = randChoice([...val1.replaceAll(",", "").replaceAll(":", "").replaceAll(";", "")]);
    const ch2 = randChoice(ASCII_LETTERS);
    const code = dedent`
        ${var1} = ${toPyStr(val1)}.${randChoice(['upper', 'lower'])}()
        ${var2} = ${toPyStr(val2)}.${randChoice(['upper', 'lower'])}()
        ${var_x} += ${toPyStr(randChoice([sep1, sep2]))} + ${var_y}
        ${var_y} = ${var_x}.replace(${toPyStr(ch1)}, ${toPyStr(ch2)})
        ${var3} = ${var_y}.split(${toPyStr(sep_x)})
        print(len(${var3}), ${var_y})
    `;
    return createQuestion(code, [], {usesOutput: true});
  }
}

export const STRINGS_MASTERY = new StringsMastery();

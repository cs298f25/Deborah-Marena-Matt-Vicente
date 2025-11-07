import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randChoice, randChoices, randVars, randInt, randInts, randIntNum } from '../util';
import { toPyStr, toPyAtom } from '../python';
import dedent from 'dedent-js';
import { MEMBERSHIP_OPERATORS } from './MembershipOperator';
import { LIST_BASICS } from './ListBasics';
import { LIST_SLICING } from './ListSlicing';

const ANIMALS = ["cat", "dog", "bird", "fish", "snake", "turtle", "duck", "cow", "pig"]

function createVarsVals(): [string[], [bigint, string, string[]], {start: bigint, stop: bigint}] {
  const [var1, var2, var3] = randVars(3);
  const list_len = randIntNum(4, 7);
  const int = randInt(2n, BigInt(list_len));
  const str = randChoice(ANIMALS);
  const list = randChoices(ANIMALS, list_len);
  let [start, stop] = randInts(1n, BigInt(list_len - 2), 2);
  if (start > stop) { [start, stop] = [stop, start]; }
  return [[var1, var2, var3], [int, str, list], {start, stop}];
}
function createCode(vars: string[], vals: [bigint, string, string[]]): string {
  const [var1, var2, var3] = vars;
  const [int, str, list] = vals;
  return dedent`
    ${var1} = ${int}
    ${var2} = ${toPyStr(str)}
    ${var3} = ${toPyAtom(list)}
  `;
}

class ListMastery extends Topic {
  vars: string[];
  vals: [bigint, string, string[]];
  values: {start: bigint, stop: bigint};
  constructor() {
    const [vars, vals, values] = createVarsVals();
    const code = createCode(vars, vals);
    super('list-mastery', 'List Mastery', [
      new ListMastery_1(vars, vals, values, code),
      new ListMastery_2(vars, vals, values, code),
      new ListMastery_3(vars, vals, values, code),
      new ListMastery_4(vars, vals, values, code),
      new ListMastery_5(vars, vals, values, code),
      new ListMastery_6(vars, vals, values, code),
      new ListMastery_7(vars, vals, values, code),
      new ListMastery_8(vars, vals, values, code),
      new ListMastery_9(vars, vals, values, code),
      new ListMastery_10(vars, vals, values, code),
      new ListMastery_Long(),
    ], [LIST_BASICS, MEMBERSHIP_OPERATORS, LIST_SLICING],
    {order: 'sequential', sharedCode: code, forceQuiz: true});
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
    this.sharedCode = createCode(vars, vals);
    for (const subtopic of this.subtopics) {
      if (subtopic instanceof ListMasteryBase) {
        subtopic.sharedCode = this.sharedCode;
      }
    }
  }
}

abstract class ListMasteryBase extends Subtopic {
  vars: string[];
  vals: [bigint, string, string[]];
  values: {start: bigint, stop: bigint};
  sharedCode: string;
  constructor(vars: string[], vals: [bigint, string, string[]], values: {start: bigint, stop: bigint}, sharedCode: string) {
    super(); this.vars = vars; this.vals = vals; this.values = values; this.sharedCode = sharedCode;
  }
  generateQuestion(): Question {
    const code = this.genCode();
    return createQuestion(code, [], {sharedCode: this.sharedCode});
  }
  abstract genCode(): string
}

class ListMastery_1 extends ListMasteryBase {
  genCode(): string { return `len(${this.vars[2]})`; }
}
class ListMastery_2 extends ListMasteryBase {
  genCode(): string { return `${this.vars[2]}[1]`; }
}
class ListMastery_3 extends ListMasteryBase {
  genCode(): string { return `${this.vars[2]}[-1]`; }
}
class ListMastery_4 extends ListMasteryBase {
  genCode(): string { return `${this.vars[2]}[${this.vars[0]}]`; }
}
class ListMastery_5 extends ListMasteryBase {
  genCode(): string {
    return randChoice([
      `len(${this.vars[2]}[1] + ${this.vars[1]})`,
      `len(${this.vars[1]} + ${this.vars[2]}[1])`,
    ]);
  }
}
class ListMastery_6 extends ListMasteryBase {
  genCode(): string { return `${this.vars[2]}[${this.values.start}:${this.values.stop}]`; }
}
class ListMastery_7 extends ListMasteryBase {
  genCode(): string { return `${this.vars[2]}[:${this.values.start}] + ${this.vars[2]}[${this.values.stop}:]`; }
}
class ListMastery_8 extends ListMasteryBase {
  genCode(): string { return `${this.vars[1]} ${randChoice(["not ", ""])}in ${this.vars[2]}`; }
}
class ListMastery_9 extends ListMasteryBase {
  genCode(): string { return `${toPyAtom(this.vals[2][0][0])} ${randChoice(["not ", ""])}in ${this.vars[2]}`; }
}
class ListMastery_10 extends ListMasteryBase {
  genCode(): string { return `${toPyAtom(this.vals[2][1][0])} in ${this.vars[2]}[1]`; }
}

class ListMastery_Long extends Subtopic {
  generateQuestion(): Question {
    const [lst_var, item_var, none_var] = randVars(3);
    const alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    const list_len = randIntNum(3, 5);
    const lst = randChoices(alphabet, list_len);
    let ch = randChoice(alphabet);
    while (lst.includes(ch)) { ch = randChoice(alphabet); }
    const [index1, index2] = randInts(1n, BigInt(list_len-1), 2);
    const lst_repr = lst.map(item => toPyStr(item));
    lst_repr.splice(randIntNum(0, list_len-1), 0, item_var);
    const option = randIntNum(0, 2);
    let code = `${item_var} = ${toPyStr(ch)}\n`
    code += `${lst_var} = [${lst_repr.join(", ")}]\n`
    if (option <= 1) {
      code += `${item_var} = ${lst_var}[${index1}]\n`
    }
    if (option >= 1) {
      code += `${lst_var}[${index2}] = ${item_var}\n`
    }
    code += `${none_var} = ${lst_var}.append(${toPyStr(ch)})\n`
    code += `print(${none_var}, ${lst_var})`
    return createQuestion(code, [], {usesOutput: true});
  }
}

export const LIST_MASTERY = new ListMastery();

import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randInt, randChoice, randChoices, STRINGS, randVariable } from '../util';
import { STRING_CONCAT } from './StringConcat';

export class PrintString extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`
      print("${a}")
      print('${b}')
    `, [
      a, b,
      `${a}\n${b}`, 
      `${b}\n${a}`,
      `"${a}"\n'${b}'`,
      `'${b}'\n"${a}"`,
      `"${a}${b}"`,
      `"${a} ${b}"`,
      `${a}${b}`,
      `${b}${a}`,
      `${a} ${b}`,
    ]);
  }
}

export class PrintStringMulti extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`
      print('${a}', "${b}")
    `, [
      `${b}\n${a}`,
      `"${a}"\n'${b}'`,
      `'${b}'\n"${a}"`,
      `"${a}${b}"`,
      `"${a}" "${b}"`,
      `'${a}' "${b}"`,
      `"${a} ${b}"`,
      `${a}${b}`,
      `${b}${a}`,
      `${a} ${b}`,
    ]);
  }
}

export class PrintStringVar extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoice(STRINGS);
    return createQuestion(`
      ${x} = "${a}"
      print(${x})
    `, [
      x, a,
      `"${x}"`,
      `'${x}'`,
      `"${a}"`,
      `'${a}'`
    ]);
  }
}

export class PrintStringVar2 extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`
      ${x} = "${a}"
      print(${x})
      print("${b}")
    `, [
      `${x}\n${b}`,
      `"${a}"\n'${b}'`,
      `'${b}'\n"${a}"`,
      `${x}${b}`,
      `${x} ${b}`,
      `${a}${b}`,
      `${b}${a}`,
      `${a} ${b}`,
    ]);
  }
}

export class PrintStringMultiVar extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, b, c] = randChoices(STRINGS, 3);
    return createQuestion(`
      ${x} = "${a}"
      ${b} = "${c}"
      print(${x}, "${b}")
      print("${x}", ${b})
    `, [
      `${x} ${b}\n${x} ${b}`,
      `${x} ${b}\n${x} ${c}`,
      `${x} ${b}\n${a} ${b}`,
      `${x} ${b}\n${a} ${c}`,
      `${x} ${b}\n${a} ${b}`,
    ]);
  }
}

export class PrintStringUpdateVar extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`
      ${x} = "${a}"
      print(${x})
      ${x} = "${b}"
      print(${x})
    `, [
      `${a}\n${a}`,
      `${b}\n${b}`,
      `${b}\n${a}`,
      `${x}\n${a}`,
      `${x}\n${b}`,
      `${x}\n${x}`,
    ]);
  }
}

export class PrintStringWithMath extends Subtopic {
  generateQuestion(): Question {
    const a = randInt(1n, 10n);
    const b = randInt(1n, 10n);
    return createQuestion(`
      print(${a} + ${b})
    `, [
      `${a} + ${b}`,
      `"${a} + ${b}"`,
      `"${a}" + "${b}"`,
      `${a}${b}`,
      `"${a}${b}"`,
    ]);
  }
}

export class PrintStringWithQuotedMath extends Subtopic {
  generateQuestion(): Question {
    const a = randInt(1n, 10n);
    const b = randInt(1n, 10n);
    return createQuestion(`
      print("${a} + ${b}")
    `, [
      a + b,
      `"${a} + ${b}"`,
      `"${a}" + "${b}"`,
      `${a}${b}`,
      `"${a}${b}"`,
    ]);
  }
}

export class PrintStringWithQuotedMath2 extends Subtopic {
  generateQuestion(): Question {
    const a = randInt(1n, 10n);
    const b = randInt(1n, 10n);
    return createQuestion(`
      print("${a}" + "${b}")
    `, [
      a + b,
      `"${a}" + "${b}"`,
      `"${a} + ${b}"`,
      `${a} + ${b}`,
      `"${a}${b}"`,
    ]);
  }
}

export const BASIC_PRINTS: Topic = new Topic('basic-prints', 'Basic Printing', [
  new PrintString(),
  new PrintStringMulti(),
  new PrintStringVar(),
  new PrintStringVar2(),
  new PrintStringMultiVar(),
  new PrintStringUpdateVar(),
  new PrintStringWithMath(),
  new PrintStringWithQuotedMath(),
  new PrintStringWithQuotedMath2(),
], [STRING_CONCAT]);

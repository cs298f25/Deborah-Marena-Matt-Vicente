import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randChoice, randChoices, randVariable, STRINGS } from '../util';
import { STRING_CONCAT } from './StringConcat';

export class StringLen extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    return createQuestion(`len("${a}")`, [
      BigInt(a.length + 1),
      BigInt(a.length + 2),
      BigInt(a.length - 1),
      BigInt(a.length - 2),
    ]);
  }
}

export class StringLenMulti extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`len("${a}") + len("${b}")`, [
      BigInt(a.length),
      BigInt(b.length),
      BigInt(a.length + b.length + 1),
      BigInt(a.length + b.length - 1),
    ]);
  }
}

export class StringLenMultiConcat extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`len("${a}" + "${b}")`, [
      BigInt(a.length),
      BigInt(b.length),
      BigInt(a.length + b.length + 1),
      BigInt(a.length + b.length - 1),
    ]);
  }
}

export class StringLenVar extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randChoice(STRINGS);
    return createQuestion(`
      ${x} = "${a}"
      len(${x})
    `, [
      BigInt(a.length),
      BigInt(x.length),
      BigInt(a.length + 1),
      BigInt(a.length - 1),
    ]);
  }
}

export class StringLenMultiVar extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`
      ${x} = "${a}"
      len(${x}) + len("${b}")
    `, [
      BigInt(a.length),
      BigInt(b.length),
      BigInt(x.length),
      BigInt(a.length + b.length + 1),
      BigInt(a.length + b.length - 1),
    ]);
  }
}

export class StringLenMultiVarConcat extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`
      ${x} = "${a}"
      len("${b}" + ${x})
    `, [
      BigInt(a.length),
      BigInt(b.length),
      BigInt(x.length),
      BigInt(a.length + b.length + 1),
      BigInt(a.length + b.length - 1),
    ]);
  }
}

export const STRING_LENGTH: Topic = new Topic('string-length', 'String Length', [
  new StringLen(),
  new StringLenMulti(),
  new StringLenMultiConcat(),
  new StringLenVar(),
  new StringLenMultiVar(),
  new StringLenMultiVarConcat(),
], [STRING_CONCAT]);

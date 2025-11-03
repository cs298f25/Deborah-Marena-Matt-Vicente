import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randVariable, randInt, randFloat, randFloats, randChoice, randChoices } from '../util';
import { toPyFloat, toPyStr, createException } from '../python';
import { BASIC_RELATIONAL_OPERATORS } from './BasicRelationalOperators';
import { randOperation, BASIC_VARIABLES } from './BasicVariables';

const STRINGS = ["A", "B", "C", "D"];
const OPS = ['==', '!=', '<', '<=', '>', '>='];
function randOp(): string { return randChoice(OPS); }

export class CompareFloats extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const [a, b] = randFloats(1, 5, 2);
    const op = randOp();
    return createQuestion(`
      ${x} = ${toPyFloat(a, 1)}
      ${x} ${op} ${toPyFloat(b, 1)}`,
      [true, false, createException('TypeError')]);
  }
}

export class CompareFloatWithInt extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randFloat(1, 5);
    const b = randInt(1n, 5n);
    const op = randOp();
    return createQuestion(`
      ${x} = ${toPyFloat(a, 1)}
      ${x} ${op} ${b}`,
      [true, false, createException('TypeError', `'${op}' not supported between instances of 'float' and 'int'`)]);
  }
}

export class CompareFloatWithIntEqual extends Subtopic {
  generateQuestion(): Question {
    const x = randVariable();
    const a = randInt(1n, 5n);
    const b = Number(a);
    const op = "==";
    return createQuestion(`
      ${x} = ${toPyFloat(b, 1)}
      ${a} ${op} ${x}`,
      [true, false, createException('TypeError', `'${op}' not supported between instances of 'float' and 'int'`)]);
  }
}
  
export class CompareWithMath extends Subtopic {
  generateQuestion(): Question {
    const [a, b, c, d] = randFloats(1, 5, 4);
    const op1 = randOperation();
    const op2 = randOperation();
    const rel = randOp();
    return createQuestion(`${a} ${op1} ${b} ${rel} ${c} ${op2} ${d}`,
      [true, false, createException('TypeError')]);
  }
}

export class CompareStrings extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    let rel = randOp();
    while (rel == "==" || rel == "!=") { rel = randOp(); }
    return createQuestion(`${toPyStr(a)} ${rel} ${toPyStr(b)}`,
      [true, false, createException('TypeError')]);
  }
}

export class CompareStringsEqual_True extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const rel = "==";
    return createQuestion(`"${a}" ${rel} '${a}'`,
      [true, false, createException('TypeError')]);
  }
}

export class CompareStringsEqual_False extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const rel = "==";
    return createQuestion(`"${a}" ${rel} "${a}"`,
      [true, false, createException('TypeError')]);
  }
}

export class CompareStringsIntEqual extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const b = randInt(1n, 5n);
    const rel = "==";
    return createQuestion(`"${a}" ${rel} ${b}`,
      [true, false, createException('TypeError', `'${rel}' not supported between instances of 'str' and 'int'`)]);
  }
}

export class CompareStringsIntEqual2 extends Subtopic {
  generateQuestion(): Question {
    const b = randInt(1n, 5n);
    const rel = "==";
    return createQuestion(`"${b}" ${rel} ${b}`,
      [true, false, createException('TypeError', `'${rel}' not supported between instances of 'str' and 'int'`)]);
  }
}

export class CompareStringsIntLT extends Subtopic {
  generateQuestion(): Question {
    const a = randChoice(STRINGS);
    const b = randInt(1n, 5n);
    const rel = "<";
    return createQuestion(`"${a}" ${rel} ${b}`,
      [true, false, createException('TypeError', `'${rel}' not supported between instances of 'str' and 'int'`)]);
  }
}

export class CompareStringsIntLT2 extends Subtopic {
  generateQuestion(): Question {
    const b = randInt(1n, 5n);
    const rel = "<";
    return createQuestion(`"${b-1n}" ${rel} ${b}`,
      [true, false, createException('TypeError', `'${rel}' not supported between instances of 'str' and 'int'`)]);
  }
}


export const RELATIONAL_OPERATORS = new Topic('relational-operators', 'Relational Operators', [
    new CompareFloats(),
    new CompareFloats(),
    new CompareFloatWithInt(),
    new CompareFloatWithInt(),
    new CompareFloatWithIntEqual(),
    new CompareWithMath(),
    new CompareWithMath(),
    new CompareStrings(),
    new CompareStrings(),
    new CompareStringsEqual_True(),
    new CompareStringsEqual_False(),
    new CompareStringsIntEqual(),
    new CompareStringsIntEqual2(),
    new CompareStringsIntLT(),
    new CompareStringsIntLT2(),
], [BASIC_RELATIONAL_OPERATORS, BASIC_VARIABLES], {order: 'random'});
import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randBool, randBools } from '../util';
import { toPyBool } from '../python';
import { BASIC_ARITHMETIC } from './BasicArithmetic';

export class BooleanOperator extends Subtopic {
  op: string;
  constructor(op: string) { super(); this.op = op; }
  generateQuestion(): Question {
    const [a, b] = randBools(2);
    return createQuestion(`
      ${toPyBool(a)} ${this.op} ${toPyBool(b)}`, [true, false]);
  }
}

export class AndOperator_True_True extends Subtopic {
  generateQuestion(): Question {
    const a = true;
    const b = true;
    return createQuestion(`
      ${toPyBool(a)} and ${toPyBool(b)}`, [true, false]);
  }
}

export class AndOperator_True_False extends Subtopic {
  generateQuestion(): Question {
    const a = true;
    const b = false;
    return createQuestion(`
      ${toPyBool(a)} and ${toPyBool(b)}`, [true, false]);
  }
}

export class AndOperator_False_True extends Subtopic {
  generateQuestion(): Question {
    const a = false;
    const b = true;
    return createQuestion(`
      ${toPyBool(a)} and ${toPyBool(b)}`, [true, false]);
  }
}

export class AndOperator_False_False extends Subtopic {
  generateQuestion(): Question {
    const a = false;
    const b = false;
    return createQuestion(`
      ${toPyBool(a)} and ${toPyBool(b)}`, [true, false]);
  }
}

export class OrOperator_True_True extends Subtopic {
  generateQuestion(): Question {
    const a = true;
    const b = true;
    return createQuestion(`
      ${toPyBool(a)} or ${toPyBool(b)}`, [true, false]);
  }
}

export class OrOperator_True_False extends Subtopic {
  generateQuestion(): Question {
    const a = true;
    const b = false;
    return createQuestion(`
      ${toPyBool(a)} or ${toPyBool(b)}`, [true, false]);
  }
}

export class OrOperator_False_True extends Subtopic {
  generateQuestion(): Question {
    const a = false;
    const b = true;
    return createQuestion(`
      ${toPyBool(a)} or ${toPyBool(b)}`, [true, false]);
  }
}

export class OrOperator_False_False extends Subtopic {
  generateQuestion(): Question {
    const a = false;
    const b = false;
    return createQuestion(`
      ${toPyBool(a)} or ${toPyBool(b)}`, [true, false]);
  }
}

export class NotOperator extends Subtopic {
  generateQuestion(): Question {
    const a = randBool();
    return createQuestion(`not ${toPyBool(a)}`, [true, false]);
  }
}

export class NotOperator_True extends Subtopic {
  generateQuestion(): Question {
    const a = true;
    return createQuestion(`not ${toPyBool(a)}`, [true, false]);
  }
}

export class NotOperator_False extends Subtopic {
  generateQuestion(): Question {
    const a = false;
    return createQuestion(`not ${toPyBool(a)}`, [true, false]);
  }
}

export const BASIC_BOOLEAN_OPERATORS = new Topic('basic-boolean-operators', 'Basic Boolean Operators', [
    new BooleanOperator('and'),
    new AndOperator_True_True(),
    new AndOperator_True_False(),
    new AndOperator_False_True(),
    new AndOperator_False_False(),
    new OrOperator_True_True(),
    new OrOperator_True_True(), // twice for practice
    new OrOperator_True_False(),
    new OrOperator_False_True(),
    new OrOperator_False_False(),
    new NotOperator(),
    new NotOperator_True(),
    new NotOperator_False(),
], [BASIC_ARITHMETIC], {order: 'random'});

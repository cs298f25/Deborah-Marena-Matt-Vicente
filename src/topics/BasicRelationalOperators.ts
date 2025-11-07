import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randInts, randInt } from '../util';
import { BASIC_ARITHMETIC } from './BasicArithmetic';

export class EqualTo_True extends Subtopic {
  generateQuestion(): Question {
    const a = randInt(1n, 10n);
    return createQuestion(`${a} == ${a}`, [true, false, a]);
  }
}

export class EqualTo_False extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randInts(1n, 10n, 2);
    return createQuestion(`${a} == ${b}`, [true, false, a, b]);
  }
}
  
export class NotEqualTo_True extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randInts(1n, 10n, 2);
    return createQuestion(`${a} != ${b}`, [true, false, a, b]);
  }
}

export class NotEqualTo_False extends Subtopic {
  generateQuestion(): Question {
    const a = randInt(1n, 10n);
    return createQuestion(`${a} != ${a}`, [true, false, a]);
  }
}

export class LessThan_True extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2);
    if (a > b) [a, b] = [b, a];
    return createQuestion(`${a} < ${b}`, [true, false, a, b]);
  }
}

export class LessThan_False extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2);
    if (a < b) [a, b] = [b, a];
    return createQuestion(`${a} < ${b}`, [true, false, a, b]);
  }
}

export class GreaterThan_True extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2);
    if (a < b) [a, b] = [b, a];
    return createQuestion(`${a} > ${b}`, [true, false, a, b]);
  }
}

export class GreaterThan_False extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2);
    if (a > b) [a, b] = [b, a];
    return createQuestion(`${a} > ${b}`, [true, false, a, b]);
  }
}

export class LessThanOrEqualTo_True extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2, false);
    if (a > b) [a, b] = [b, a];
    return createQuestion(`${a} <= ${b}`, [true, false, a, b]);
  }
}

export class LessThanOrEqualTo_False extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2, false);
    if (a <= b) [a, b] = [b, a];
    return createQuestion(`${a} <= ${b}`, [true, false, a, b]);
  }
}

export class GreaterThanOrEqualTo_True extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2, false);
    if (a < b) [a, b] = [b, a];
    return createQuestion(`${a} >= ${b}`, [true, false, a, b]);
  }
}

export class GreaterThanOrEqualTo_False extends Subtopic {
  generateQuestion(): Question {
    let [a, b] = randInts(1n, 10n, 2, false);
    if (a >= b) [a, b] = [b, a];
    return createQuestion(`${a} >= ${b}`, [true, false, a, b]);
  }
}


export const BASIC_RELATIONAL_OPERATORS = new Topic('basic-relational-operators', 'Basic Relational Operators', [
  new EqualTo_True(),
  new EqualTo_False(),
  new NotEqualTo_True(),
  new NotEqualTo_False(),
  new LessThan_True(),
  new LessThan_False(),
  new GreaterThan_True(),
  new GreaterThan_False(),
  new LessThanOrEqualTo_True(),
  new LessThanOrEqualTo_False(),
  new GreaterThanOrEqualTo_True(),
  new GreaterThanOrEqualTo_False(),
], [BASIC_ARITHMETIC], {order: 'random'});
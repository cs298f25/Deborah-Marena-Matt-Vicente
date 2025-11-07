import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randVariable, randVars, randFunc, range, randInts } from '../util';
import { FUNC_WITH_MULTIPLE_ARGS } from './FuncWithMultipleArgs';


class FuncWithMultReturnFirst extends Subtopic {
    generateQuestion(): Question {
        const x = randVariable();
        const [c, d] = randVars(2);
        const [a, b] = randInts(1n, 5n, 2);
        const func = randFunc();
        return createQuestion(`
          def ${func}(${x}):
              return ${x}, ${x} + ${b}
          ${c}, ${d} = ${func}(${a})
          ${c}`, [...range(0n, 10n), null, Error()]
        );
    }
}

class FuncWithMultReturnSecond extends Subtopic {
    generateQuestion(): Question {
        const x = randVariable();
        const [c, d] = randVars(2);
        const [a, b] = randInts(1n, 5n, 2);
        const func = randFunc();
        return createQuestion(`
          def ${func}(${x}):
              return ${x}, ${x} + ${b}
          ${c}, ${d} = ${func}(${a})
          ${d}`, [...range(0n, 10n), null, Error()]
        );
    }
}

class FuncWithMultReturnBoth extends Subtopic {
    generateQuestion(): Question {
        const x = randVariable();
        const [c, d] = randVars(2);
        const [a, b] = randInts(1n, 5n, 2);
        const func = randFunc();
        return createQuestion(`
          def ${func}(${x}):
              return ${x}, ${x} - ${b}
          ${c}, ${d} = ${func}(${a})
          ${c} + ${d}`, [...range(0n, 10n), null, Error()]
        );
    }
}

class FuncWithNoReturn extends Subtopic {
    generateQuestion(): Question {
        const [x, y, z] = randVars(3);
        const [a, b] = randInts(1n, 5n, 2, false);
        const func = randFunc();
        return createQuestion(`
          def ${func}(${x}, ${y}):
              ${x} + ${y}
          ${z} = ${func}(${a}, ${b})
          ${z}`, [...range(0n, 10n), null, Error()]
        );
    }
}

class FuncWithNoReturnNamed extends Subtopic {
    generateQuestion(): Question {
        const [x, y, z] = randVars(3);
        const [a, b] = randInts(1n, 5n, 2, false);
        const func = randFunc();
        return createQuestion(`
          def ${func}(${x}, ${y}):
              ${func} = ${x} + ${y}
          ${z} = ${func}(${a}, ${b})
          ${z}`, [...range(0n, 10n), null, Error()]
        );
    }
}

class FuncWithNoReturnNamedOutside extends Subtopic {
    generateQuestion(): Question {
        const [x, y, z] = randVars(3);
        const [a, b] = randInts(1n, 5n, 2, false);
        const func = randFunc();
        return createQuestion(`
          def ${func}(${x}, ${y}):
              ${z} = ${x} + ${y}
          ${z} = ${func}(${a}, ${b})
          ${z}`, [...range(0n, 10n), null, Error()]
        );
    }
}

export const FUNC_WITH_MULT_OR_NO_RETURN: Topic = new Topic('func-with-mult-or-no-return', 'Functions with Multiple/No Return', [
  new FuncWithMultReturnFirst(),
  new FuncWithMultReturnSecond(),
  new FuncWithMultReturnBoth(),
  new FuncWithNoReturn(),
  new FuncWithNoReturnNamed(),
  new FuncWithNoReturnNamedOutside(),
], [FUNC_WITH_MULTIPLE_ARGS]);

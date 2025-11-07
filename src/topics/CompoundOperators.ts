import { Question, Subtopic, Topic, createQuestion } from '../topics';
import { randInts, randVariable, randVars, range, STRINGS, randChoices } from '../util';
import { BASIC_ARITHMETIC } from './BasicArithmetic';
import { BASIC_VARIABLES } from './BasicVariables';
import { STRING_CONCAT } from './StringConcat';

export class CompoundAdd extends Subtopic {
    generateQuestion(): Question {
        const var1 = randVariable();
        const [a, b] = randInts(1n, 5n, 2);
        const op = '+';
        return createQuestion(`
            ${var1} = ${a}
            ${var1} ${op}= ${b}
            ${var1}`, [a, b, a + b, var1, Symbol(var1), ...range(0n, 10n)]);
    }
}

export class CompoundSubtract extends Subtopic {
    generateQuestion(): Question {
        const var1 = randVariable();
        const [a, b] = randInts(1n, 5n, 2);
        const op = '-';
        return createQuestion(`
            ${var1} = ${a}
            ${var1} ${op}= ${b}
            ${var1}`, [a, b, a - b, var1, Symbol(var1), ...range(-5n, 5n)]);
    }
}

export class CompoundMultiply extends Subtopic {
    generateQuestion(): Question {
        const var1 = randVariable();
        const [a, b] = randInts(1n, 3n, 2);
        const op = '*';
        return createQuestion(`
            ${var1} = ${a}
            ${var1} ${op}= ${b}
            ${var1}`, [a, b, a * b, var1, Symbol(var1), ...range(0n, 10n)]);
    }
}

export class CompoundMulti extends Subtopic {
    generateQuestion(): Question {
        const var1 = randVariable();
        const [a, b, c] = randInts(1n, 4n, 3);
        return createQuestion(`
            ${var1} = ${a}
            ${var1} *= ${b} + ${c}
            ${var1}`, [a, b, c, a * (b + c), ...range(0n, 10n)]);
    }
}

export class CompoundConcat extends Subtopic {
    generateQuestion(): Question {
        const var1 = randVariable();
        const [a, b] = randChoices(STRINGS, 2);
        const op = '+';
        return createQuestion(`
            ${var1} = "${a}"
            ${var1} ${op}= "${b}"
            ${var1}`, [a, b, a + b, var1, Symbol(var1), b + a]);
    }
}

export class CompoundAddVar extends Subtopic {
    generateQuestion(): Question {
        const [var1, var2] = randVars(2);
        const [a, b] = randInts(1n, 5n, 2);
        const op = '+';
        return createQuestion(`
            ${var1} = ${a}
            ${var2} = ${b}
            ${var1} ${op}= ${var2}
            ${var1}`, [a, b, a + b, var1, Symbol(var1), var2, Symbol(var2), var1 + var2, Symbol(var1 + var2), ...range(0n, 10n)]);
    }
}

export class CompoundConcatVar extends Subtopic {
    generateQuestion(): Question {
        const [var1, var2] = randVars(2);
        const [a, b] = randChoices(STRINGS, 2);
        const op = '+';
        return createQuestion(`
            ${var1} = "${a}"
            ${var2} = "${b}"
            ${var1} ${op}= ${var2}
            ${var1}`, [a, b, a + b, b + a, var1, Symbol(var1), var2, Symbol(var2), var1 + var2, Symbol(var1 + var2)]);
    }
}

export const COMPOUND_OPERATORS: Topic = new Topic('compound-operators', 'Compound Operators', [
    new CompoundAdd(),
    new CompoundSubtract(),
    new CompoundMultiply(),
    new CompoundMulti(),
    new CompoundConcat(),
    new CompoundAddVar(),
    new CompoundConcatVar(),
], [BASIC_ARITHMETIC, BASIC_VARIABLES, STRING_CONCAT]);

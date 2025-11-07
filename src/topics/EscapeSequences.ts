import { Question, Subtopic, Topic, createQuestion } from "../topics";
import { STRINGS, randChoice, randChoices } from "../util";
import { toPyStr } from "../python";
import { BASIC_VARIABLES } from "./BasicVariables";

export class EscapeSequenceSingleQuote extends Subtopic {
  generateQuestion(): Question {
    return createQuestion(`'\\''`, ['\'', '\\\'']);
  }
}

export class EscapeSequenceSingleQuotePrint extends Subtopic {
  generateQuestion(): Question {
    return createQuestion(`print('\\'')`, ['\'', '\\\'']);
  }
}

export class EscapeSequenceDoubleQuote extends Subtopic {
  generateQuestion(): Question {
    return createQuestion(`"\\""`, ['"', '\\"']);
  }
}

export class EscapeSequenceDoubleQuotePrint extends Subtopic {
  generateQuestion(): Question {
    return createQuestion(`print("\\"")`, ['"', '\\"']);
  }
}

const QUOTES = [
  "She said, \"I'm hungry.\"",
  "He said, \"We're going to the store.\"",
  "They asked, \"Can't you see?\"",
  "We said, \"Let's go.\"",
  "She stated, \"He's here.\"",
  "He said, \"I've been waiting for you.\"",
  "They asked, \"Don't you know?\"",
  "We told you, \"There's a problem.\"",
];

export class EscapeSequenceQuotePrint extends Subtopic {
  generateQuestion(): Question {
    const s = randChoice(QUOTES);
    return createQuestion(`print(${toPyStr(s)})`, [s, toPyStr(s).slice(1, -1), toPyStr(s)]);
  }
}

export class EscapeSequenceNewline extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    return createQuestion(`print('${a}\\n${b}')`, [a, b, `${a}\\n${b}`, `${a}n${b}`, `${a}${b}`, `${a}\n${b}`]);
  }
}

export class EscapeSequenceBackslash extends Subtopic {
  generateQuestion(): Question {
    const [a, b] = randChoices(STRINGS, 2);
    const s = `${a}\\\\${b}`;
    return createQuestion(`print(${toPyStr(s)})`, [s, `${a}\\${b}`, `${a}\\\\${b}`, `${a}${b}`]);
  }
}

export class EscapeSequenceUnicode extends Subtopic {
  generateQuestion(): Question {
    // π ° ♣ ⌘ Ω β √ ½ € ¿
    const char = randChoice(['\\u03C0', '\\u00B0', '\\u2663', '\\u2318', '\\u03A9', '\\u03B2', '\\u221A', '\\u00BD', '\\u20AC', '\\u00BF']);
    const code = char.slice(2);
    return createQuestion(`print(${toPyStr(char)})`, [code, char]);
  }
}

export class EscapeSequenceUnicode2 extends Subtopic {
  generateQuestion(): Question {
    // 😛 😜 😝 😞 😟 😠 😡 😢 😣 😤
    const char = randChoice(['\\U0001F61B', '\\U0001F61C', '\\U0001F61D', '\\U0001F61E', '\\U0001F61F', '\\U0001F620', '\\U0001F621', '\\U0001F622', '\\U0001F623', '\\U0001F624']);
    const code = char.slice(2);
    return createQuestion(`print(${toPyStr(char)})`, [code, `\\U${code}`]);
  }
}

export const ESCAPE_SEQUENCES: Topic = new Topic('escape-sequences', 'Escape Sequences', [
  new EscapeSequenceSingleQuote(),
  new EscapeSequenceSingleQuotePrint(),
  new EscapeSequenceDoubleQuote(),
  new EscapeSequenceDoubleQuotePrint(),
  new EscapeSequenceQuotePrint(),
  new EscapeSequenceNewline(),
  new EscapeSequenceBackslash(),
  new EscapeSequenceUnicode(),
  new EscapeSequenceUnicode2(),
], [BASIC_VARIABLES]);
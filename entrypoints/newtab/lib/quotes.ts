// 每日一句：本地内置，按当天日期取（同一天稳定不抖动）。serif 大字展示。

export interface Quote {
  text: string;
  author: string;
}

const QUOTES: Quote[] = [
  { text: '我们必须想象西西弗斯是幸福的。', author: '加缪' },
  { text: '风物长宜放眼量。', author: '毛泽东' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: '不积跬步，无以至千里。', author: '荀子' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: '宠辱不惊，看庭前花开花落。', author: '《菜根谭》' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
  { text: 'What we know is a drop, what we don’t know is an ocean.', author: 'Newton' },
  { text: '行到水穷处，坐看云起时。', author: '王维' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: '博学之，审问之，慎思之，明辨之，笃行之。', author: '《中庸》' },
];

export function quoteOfTheDay(date = new Date()): Quote {
  // 用「年内第几天」做索引，全天稳定。
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

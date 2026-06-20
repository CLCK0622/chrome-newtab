// 每日一句：本地内置，按当天日期取（同一天稳定不抖动）。serif 大字展示。

export interface Quote {
  text: string;
  author: string;
}

const QUOTES: Quote[] = [
  { text: 'We must imagine Sisyphus happy.', author: 'Albert Camus' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'What we know is a drop, what we don’t know is an ocean.', author: 'Isaac Newton' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Whereof one cannot speak, thereof one must be silent.', author: 'Ludwig Wittgenstein' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'What gets measured gets managed.', author: 'Peter Drucker' },
  { text: 'The future is already here — it’s just not evenly distributed.', author: 'William Gibson' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
];

export function quoteOfTheDay(date = new Date()): Quote {
  // 用「年内第几天」做索引，全天稳定。
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}

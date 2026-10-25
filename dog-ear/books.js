// Original short reads written for Dog-Ear. Each page is one short paragraph.
window.MOODS = [
  { id: 'cozy', label: 'Murder, but cozy' },
  { id: 'dragons', label: 'Dragons with feelings' },
  { id: 'wrong', label: 'Smart people being wrong' },
  { id: 'space', label: 'Space, mostly lonely' },
  { id: 'romance', label: 'Romance with a plot' },
  { id: 'selfhelp', label: 'Self-help I will not apply' },
  { id: 'history', label: 'Historical drama, long' },
  { id: 'poetry', label: 'Poetry, short' }
];

window.BOOKS = [
  {
    id: 'casserole', mood: 'cozy', title: 'The Case of the Missing Casserole', author: 'Edna Pickle', color: '#FF8FB8', tag: 'Cozy murder',
    pages: [
      'The casserole was last seen at 6:02 p.m., cooling on the sill of Mrs. Abernathy\'s kitchen. By 6:09 it was gone, leaving only a ring of steam and a deeply suspicious breadcrumb.',
      'Detective Marge Fennimore did not believe in coincidences, but she did believe in second helpings. "Somebody in this village is very hungry," she said, "and very bad at hiding it."',
      'Three suspects: the vicar, who had gravy on his cuff; the twins, who had cheese on their knees; and the cat, who simply had an alibi and a smug face.',
      'It was the vicar. It is always the vicar. But Marge let him keep one bite, because justice is important, and so is mercy, and so is carbs.'
    ]
  },
  {
    id: 'dragons', mood: 'dragons', title: 'Dragons Have Feelings Too', author: 'Ignatius Wick', color: '#F6FF5C', tag: 'Dragons, feelings',
    pages: [
      'Smolder the dragon had burned down four villages that year, and he felt really, really bad about the last one. It had a lovely bakery.',
      '"I am not a monster," he told the knight who had come to slay him. "I am a creature with a rich inner life and a hot temper."',
      'The knight lowered his sword. "I am not a hero," he admitted. "I am a man whose mother wanted me to try something outdoorsy."',
      'They shared a pot of tea, which Smolder boiled by sneezing. By sunset, they had agreed to be friends, and to rebuild the bakery together.'
    ]
  },
  {
    id: 'naps', mood: 'selfhelp', title: 'A Brief History of Naps', author: 'Dr. Lou Snoozeman', color: '#0B1120', tag: 'Self-help you may skip',
    pages: [
      'Chapter One: You are tired. This is not a character flaw. This is biology, which has been sending you memos since 2 p.m.',
      'Chapter Two: Every great civilization napped. The Romans napped. The Spanish napped. Nobody who napped ever started a productivity podcast.',
      'Chapter Three: To begin, find a flat surface. Lie on it. If you are reading this upright, you have already missed the point.',
      'Chapter Four: There is no Chapter Four. You have fallen asleep, and the book is proud of you.'
    ]
  },
  {
    id: 'mars', mood: 'space', title: 'Mars Is Quiet Today', author: 'Ola Vance', color: '#2B3BFF', tag: 'Lonely space',
    pages: [
      'The rover woke at dawn, which on Mars is a kind of bruise-coloured shrug. "Good morning," it said to no one. No one replied. This was normal.',
      'Each day it logged the temperature, the wind, and the feelings it was not supposed to have. Today: minus sixty, calm, and a small dull ache.',
      'Then, on the ridge, a glint. A second rover, long dead, dust to its axles. The first rover rolled over and parked very close, just to keep it company.',
      'It transmitted a single message home: "Found a friend. Staying a while." Earth read it nine minutes later and, for once, did not know what to say.'
    ]
  },
  {
    id: 'spreadsheet', mood: 'romance', title: 'Love, Actually a Spreadsheet', author: 'June Ledger', color: '#FF8FB8', tag: 'Romance with a plot',
    pages: [
      'Priya met Theo in cell B14, where she had been merging things she should not merge. He fixed her formula and, in doing so, quietly fixed her Tuesday.',
      '"You use VLOOKUP like a poet," he said. It was the most romantic thing anyone had ever said to her, and it was about a function.',
      'Then came the plot: the quarterly audit, a missing seven-figure total, and a rival accountant with a mysteriously tidy desk.',
      'They solved it together. The error was one stray decimal, and so, they decided, was every great love story. They went for dumplings.'
    ]
  },
  {
    id: 'haiku', mood: 'poetry', title: 'Haiku for Monday', author: 'Kit Brevity', color: '#F6FF5C', tag: 'Very short poems',
    pages: [
      'Alarm, third snooze, then / the ceiling says nothing new. / Coffee, take my hand.',
      'Inbox, full again. / A meeting could be an email. / It is not. It is.',
      'Lunch at the desk, sad. / A crumb falls on the keyboard. / Even it sighs, "Monday."',
      'Evening, finally. / The couch remembers your shape. / Nothing else has. Rest.'
    ]
  },
  {
    id: 'scientists', mood: 'wrong', title: 'Very Confident Scientists', author: 'A. N. Hindsight', color: '#BFD7FF', tag: 'Smart people, wrong',
    pages: [
      'In 1790, the Royal Society met to confirm that the moon was made of a type of very dense cheese. The vote was 14 to 2. The two were fired.',
      'Their evidence was strong: it was round, it was yellow, and nobody had ever returned from it to complain.',
      'Over the next century, the theory was refined, then expanded, then given a conference. A keynote was delivered by a man holding a wedge of cheddar for comparison.',
      'Eventually someone looked through a better telescope. The Society issued a short statement: "We stand by our methods and regret the cheese."'
    ]
  },
  {
    id: 'dinner', mood: 'history', title: 'The Long Siege of Dinner', author: 'Cornelius Gravy', color: '#0B1120', tag: 'Long-ish history',
    pages: [
      'In the winter of 1423, the castle of Wexbury was besieged for nine months, and for nine months the cook insisted that supper would be "just a few minutes more".',
      'Within the walls, the lord paced. Without them, the enemy yawned. Both sides agreed, privately, that the soup was the real war.',
      'On the two-hundredth day the cook produced a stew of astonishing mystery. The lord ate it. The enemy smelled it. A truce was signed before the second ladle.',
      'Historians still argue over who won. Everyone agrees on who cooked. The recipe was lost, which the cook said was exactly how he wanted it.'
    ]
  }
];

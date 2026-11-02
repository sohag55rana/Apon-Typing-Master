export interface Lesson {
  id: number;
  title: string;
  /** Keys used to build the practice text */
  keys: string;
  /** Keys being introduced in this lesson (highlighted on the keyboard) */
  newKeys: string;
  description: string;
}

export const PASS_ACCURACY = 90;

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Left hand: a s d f",
    keys: "asdf",
    newKeys: "asdf",
    description:
      "Rest your left fingers on a, s, d and f. Keep your eyes on the screen.",
  },
  {
    id: 2,
    title: "Right hand: j k l",
    keys: "jkl",
    newKeys: "jkl",
    description: "Rest your right fingers on j, k and l.",
  },
  {
    id: 3,
    title: "Index fingers: g h",
    keys: "fjgh",
    newKeys: "gh",
    description: "Your index fingers reach sideways to g and h, then return.",
  },
  {
    id: 4,
    title: "Home row: a to l",
    keys: "asdfghjkl",
    newKeys: "asdfghjkl",
    description: "Practice all the home row keys together.",
  },
  {
    id: 5,
    title: "Numbers 1 2 3 4 5",
    keys: "12345",
    newKeys: "12345",
    description:
      "Reach up with your left hand. Return to the home row after each key.",
  },
  {
    id: 6,
    title: "Numbers 6 7 8 9",
    keys: "6789",
    newKeys: "6789",
    description:
      "Reach up with your right hand. Return to the home row after each key.",
  },
  {
    id: 7,
    title: "Numbers 1 to 9",
    keys: "123456789",
    newKeys: "123456789",
    description: "All the number keys together.",
  },
  {
    id: 8,
    title: "Letters and numbers",
    keys: "asdfghjkl123456789",
    newKeys: "",
    description: "Home row letters mixed with numbers.",
  },
];

/** Build 35 practice words, each 4-5 characters long, from the lesson keys. */
export function generateText(keys: string, groups = 35): string {
  const chars = keys.split("");
  const words: string[] = [];
  for (let g = 0; g < groups; g++) {
    const len = 4 + Math.floor(Math.random() * 2);
    let word = "";
    for (let i = 0; i < len; i++) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    words.push(word);
  }
  return words.join(" ");
}

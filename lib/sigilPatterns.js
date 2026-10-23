// The Life patterns behind each project's sigil (6×6 cells), shared by the sigil
// component and the share cards.
export const PATTERNS = {
  glider: [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
  blinker: [[1, 2], [2, 2], [3, 2]],
  clock: [[3, 1], [1, 2], [3, 2], [2, 3], [4, 3], [2, 4]],
  toad: [[2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3]],
  beacon: [[1, 1], [2, 1], [1, 2], [2, 2], [3, 3], [4, 3], [3, 4], [4, 4]],
  tub: [[2, 1], [1, 2], [3, 2], [2, 3]],
};

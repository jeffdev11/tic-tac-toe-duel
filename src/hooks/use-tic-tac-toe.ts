import { useCallback, useState } from "react";

type Player = "X" | "O";
type Cell = Player | null;
type GameStatus = { winner: Player | "draw"; line: readonly number[] | null } | null;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function checkWinner(board: Cell[]): GameStatus {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, line };
    }
  }
  if (board.every(Boolean)) return { winner: "draw", line: null };
  return null;
}

export function useTicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [status, setStatus] = useState<GameStatus>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] || status) return;

      const nextBoard = [...board];
      nextBoard[index] = currentPlayer;
      setBoard(nextBoard);

      const nextStatus = checkWinner(nextBoard);
      if (nextStatus) {
        setStatus(nextStatus);
        setScores((prev) => {
          if (nextStatus.winner === "X") return { ...prev, X: prev.X + 1 };
          if (nextStatus.winner === "O") return { ...prev, O: prev.O + 1 };
          return { ...prev, draws: prev.draws + 1 };
        });
      } else {
        setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
      }
    },
    [board, currentPlayer, status]
  );

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setStatus(null);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  }, [resetGame]);

  return {
    board,
    currentPlayer,
    status,
    scores,
    handleCellClick,
    resetGame,
    resetScores,
  };
}

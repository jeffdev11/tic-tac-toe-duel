import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jogo da Velha — 2 Jogadores" },
      { name: "description", content: "Jogo da velha para dois jogadores no mesmo computador." },
      { property: "og:title", content: "Jogo da Velha — 2 Jogadores" },
      { property: "og:description", content: "Jogo da velha para dois jogadores no mesmo computador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TicTacToe,
});

type Player = "X" | "O";
type Cell = Player | null;
type GameStatus = { winner: Player | "draw"; line: number[] | null } | null;

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

function TicTacToe() {
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

  const titleText = status
    ? status.winner === "draw"
      ? "Empate!"
      : `Jogador ${status.winner} venceu!`
    : `Vez do jogador ${currentPlayer}`;

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Jogo da Velha</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dois jogadores no mesmo computador</p>
        </header>

        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-x text-x-foreground text-xl font-bold shadow">X</div>
              <div className="text-xs font-medium text-muted-foreground">Jogador X</div>
              <div className="text-2xl font-bold">{scores.X}</div>
            </div>

            <div className="text-center">
              <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Trophy className="h-3 w-3" />
                Empates
              </div>
              <div className="text-2xl font-bold">{scores.draws}</div>
            </div>

            <div className="text-center">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-o text-o-foreground text-xl font-bold shadow">O</div>
              <div className="text-xs font-medium text-muted-foreground">Jogador O</div>
              <div className="text-2xl font-bold">{scores.O}</div>
            </div>
          </div>
        </div>

        <div
          className={`mb-6 rounded-2xl border p-4 text-center text-lg font-semibold transition-colors ${
            status
              ? status.winner === "draw"
                ? "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-100"
                : status.winner === "X"
                ? "border-x/30 bg-x/10 text-x"
                : "border-o/30 bg-o/10 text-o"
              : "border-border bg-card text-card-foreground"
          }`}
        >
          {titleText}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, index) => {
            const isWinning = status?.line?.includes(index) ?? false;
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={Boolean(cell) || Boolean(status)}
                aria-label={cell ? `Célula ${index + 1}: ${cell}` : `Célula ${index + 1} vazia`}
                className={`relative flex aspect-square items-center justify-center rounded-2xl border-2 text-5xl font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  cell
                    ? status?.winner === "draw"
                      ? "border-border bg-muted text-muted-foreground"
                      : isWinning
                      ? "border-transparent bg-winner text-winner-foreground shadow-lg scale-[1.02]"
                      : "border-border bg-card text-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground active:scale-95"
                } ${cell === "X" ? "font-display" : ""}`}
              >
                <span
                  className={`${
                    cell === "X"
                      ? "text-x"
                      : cell === "O"
                      ? "text-o"
                      : ""
                  }`}
                >
                  {cell}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={resetGame}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-4 w-4" />
            Novo jogo
          </button>
          <button
            onClick={resetScores}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Zerar placar
          </button>
        </div>
      </div>
    </div>
  );
}

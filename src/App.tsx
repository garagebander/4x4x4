import { useState, useEffect, useRef } from 'react'
import { Board3D } from './Board3D'
import { Board3DGraphics } from './Board3DGraphics'
import type { Board, Player } from './Board3D'
import './App.css'

const createEmptyBoard = (): Board =>
  Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Array(4).fill(null as Player))
  )

// 勝敗判定: 4つ並びがあればそのPlayerを返す、なければnull
function checkWinner(board: Board): Player {
  const dirs = [
    [1,0,0],[0,1,0],[0,0,1], // x,y,z軸
    [1,1,0],[1,0,1],[0,1,1], // 面対角
    [1,-1,0],[1,0,-1],[0,1,-1],
    [1,1,1],[1,-1,1],[1,1,-1],[1,-1,-1] // 空間対角
  ];
  for (let z=0; z<4; z++) for (let y=0; y<4; y++) for (let x=0; x<4; x++) {
    const p = board[z][y][x];
    if (!p) continue;
    for (const [dx,dy,dz] of dirs) {
      let ok = true;
      for (let i=1; i<4; i++) {
        const nx = x+dx*i, ny = y+dy*i, nz = z+dz*i;
        if (nx<0||nx>=4||ny<0||ny>=4||nz<0||nz>=4||board[nz][ny][nx]!==p) { ok=false; break; }
      }
      if (ok) return p;
    }
  }
  return null;
}

// 置ける手を列挙
function getMoves(board: Board, canPlace: (z:number,y:number,x:number)=>boolean): [number,number,number][] {
  const moves: [number,number,number][] = [];
  for(let z=0;z<4;z++) for(let y=0;y<4;y++) for(let x=0;x<4;x++) {
    if(canPlace(z,y,x)) moves.push([z,y,x]);
  }
  return moves;
}

// 評価関数: 勝ち=10000, 負け=-10000, 引き分け=0, それ以外は0
function evaluate(board: Board, player: Player): number {
  const winner = checkWinner(board);
  if (winner === player) return 10000;
  if (winner && winner !== player) return -10000;
  if (getMoves(board, (z,y,x)=>board[z][y][x]===null && (z===0||board[z-1][y][x]!==null)).length === 0) return 0;
  return 0;
}

// 盤面ごとのcanPlaceを生成
function makeCanPlace(board: Board) {
  return (z: number, y: number, x: number) => {
    if (board[z][y][x] !== null) return false;
    if (z === 0) return true;
    return board[z - 1][y][x] !== null;
  };
}

// ミニマックス（αβ枝刈り, 深さ制限）
function minimax(board: Board, player: Player, depth: number, alpha: number, beta: number, maximizing: boolean): [number, [number,number,number]|null] {
  const winner = checkWinner(board);
  if (winner || depth === 0) {
    return [evaluate(board, player), null];
  }
  const canPlace = makeCanPlace(board);
  const moves = getMoves(board, canPlace);
  if (moves.length === 0) return [0, null];
  let bestMove: [number,number,number]|null = null;
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const [z,y,x] = move;
      const next = board.map(layer => layer.map(row => [...row])) as Board;
      next[z][y][x] = player;
      const [evalScore] = minimax(next, player, depth-1, alpha, beta, false);
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const [z,y,x] = move;
      const next = board.map(layer => layer.map(row => [...row])) as Board;
      next[z][y][x] = player === 1 ? 2 : 1;
      const [evalScore] = minimax(next, player, depth-1, alpha, beta, true);
      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = move;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return [minEval, bestMove];
  }
}

function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [current, setCurrent] = useState<Player>(1)
  const [winner, setWinner] = useState<Player>(null)
  const [aiEnabled] = useState(true) // 2P=AI固定
  const [aiThinking, setAiThinking] = useState(false)
  const aiNextMove = useRef<[number,number,number]|null>(null)
  const aiCalcId = useRef(0)

  // z軸の重力ルール: 下にコマがないときは置けない
  const canPlace = (z: number, y: number, x: number) => {
    if (board[z][y][x] !== null) return false
    if (z === 0) return true // 一番下はOK
    return board[z - 1][y][x] !== null
  }

  // プレイヤーの手
  const handleCellClick = (z: number, y: number, x: number) => {
    if (winner || board[z][y][x] !== null) return
    const newBoard = board.map((layer, zi) =>
      layer.map((row, yi) =>
        row.map((cell, xi) =>
          zi === z && yi === y && xi === x ? 1 : cell
        )
      )
    ) as Board
    setBoard(newBoard)
    const win = checkWinner(newBoard)
    if (win) {
      setWinner(win)
    } else {
      setCurrent(2)
    }
  }

  // AIの手: その場で計算して指す
  useEffect(() => {
    if (!aiEnabled || winner || current !== 2) return;
    setAiThinking(true);
    setTimeout(() => {
      const [, move] = minimax(board, 2, 4, -Infinity, Infinity, true);
      if (!move) {
        setAiThinking(false);
        return;
      }
      const [z, y, x] = move;
      if (!makeCanPlace(board)(z, y, x)) {
        setAiThinking(false);
        return;
      }
      const newBoard = board.map((layer, zi) =>
        layer.map((row, yi) =>
          row.map((cell, xi) =>
            zi === z && yi === y && xi === x ? 2 : cell
          )
        )
      ) as Board;
      setBoard(newBoard);
      const win = checkWinner(newBoard);
      setAiThinking(false);
      if (win) {
        setWinner(win);
      } else {
        setCurrent(1);
      }
    }, 400);
  }, [aiEnabled, board, current, winner]);

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrent(1);
    setWinner(null);
    aiNextMove.current = null;
    aiCalcId.current = 0;
  }

  return (
    <div className="app">
      <div className="board">
        <Board3D board={board} onCellClick={handleCellClick} canPlace={canPlace} />
        <Board3DGraphics board={board} />
        {aiThinking && <div className="ai-thinking">AIの思考中...</div>}
      </div>
      <div className="info">
        {winner ? (
          <div className="winner">勝者: {winner === 1 ? 'あなた' : 'AI'}</div>
        ) : (
          <div className="turn">{current === 1 ? 'あなたの番' : 'AIの番'}</div>
        )}
        <button onClick={handleReset}>リセット</button>
      </div>
    </div>
  )
}

export default App

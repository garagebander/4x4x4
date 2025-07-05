import React, { useRef, useEffect, useState } from 'react';
import type { Board } from './Board3D';

// 3Dグラフィック表示（Canvasベース、マウスドラッグで回転可能）
export const Board3DGraphics: React.FC<{ board: Board }> = ({ board }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // x: 上下の見下ろし角度, z: Z軸回転
  const [angle, setAngle] = useState({ x: 60, z: 30 }); // 初期値: 斜め上から見下ろす
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3D→2D投影用パラメータ
    const cellSize = 32; // 盤面セルの大きさ
    const offsetX = 160;
    const offsetY = 120;
    const dz = 16;
    const boardSize = 4;
    const ballRadius = 8; // 球体の半径を固定値で小さく
    const cellGap = 24; // セル間の間隔をさらに広げる
    // 角度をラジアンに
    const radX = (angle.x * Math.PI) / 180;
    const radZ = (angle.z * Math.PI) / 180;

    // 3D→2D座標変換 + 視点からの奥行き計算
    function projectWithDepth(x: number, y: number, z: number) {
      // 中心化
      let px = x - (boardSize - 1) / 2;
      let py = y - (boardSize - 1) / 2;
      let pz = z - (boardSize - 1) / 2;
      // Z軸回転
      let tx = px * Math.cos(radZ) - py * Math.sin(radZ);
      let ty = px * Math.sin(radZ) + py * Math.cos(radZ);
      px = tx;
      py = ty;
      // X軸回転
      let tz = py * Math.sin(radX) + pz * Math.cos(radX);
      ty = py * Math.cos(radX) - pz * Math.sin(radX);
      py = ty;
      pz = tz;
      // 2D投影
      return {
        x: offsetX + px * (cellSize + cellGap),
        y: offsetY + py * (cellSize + cellGap) - pz * dz,
        depth: pz, // 視点からの奥行き
      };
    }

    // 全セルを配列に格納し、視点からの奥行きでソート
    const cells: Array<{
      x: number;
      y: number;
      z: number;
      cell: number;
      px: number;
      py: number;
      depth: number;
    }> = [];
    for (let z = 0; z < 4; z++) {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const cell = board[z][y][x];
          const proj = projectWithDepth(x, y, z);
          cells.push({ x, y, z, cell, px: proj.x, py: proj.y, depth: proj.depth });
        }
      }
    }
    // 奥行き（depth）が大きい順＝遠い順にソート
    cells.sort((a, b) => a.depth - b.depth);

    // ソート済みで描画
    for (const c of cells) {
      // 盤面セル
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(c.px, c.py, cellSize/2, cellSize/2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = c.cell === 1 ? '#5c8fd6' : c.cell === 2 ? '#d97b6c' : '#f5f5f5';
      ctx.globalAlpha = 0.93; // セルをさらに不透明に（0.8→0.93）
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();
      // コマ
      if (c.cell === 1 || c.cell === 2) {
        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = 0.6; // コマも半透明
        ctx.arc(c.px, c.py, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = c.cell === 1 ? '#607d8b' : '#8d6e63';
        ctx.shadowColor = '#333';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      }
    }
  }, [board, angle]);

  // マウスドラッグで回転（Z軸: 水平回転, X軸: 上下）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleDown = (e: MouseEvent) => {
      dragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    const handleUp = () => { dragging.current = false; };
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setAngle(a => ({
        x: Math.max(10, Math.min(89, a.x + dy * 0.7)), // 10〜89度で制限
        z: a.z + dx * 0.7
      }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  // ゆっくり自動回転アニメーション（Z軸回転）
  useEffect(() => {
    let req: number;
    const animate = () => {
      setAngle(a => ({ x: a.x, z: a.z + 0.06 })); // z軸をさらにゆっくり回転（0.3→0.06）
      req = requestAnimationFrame(animate);
    };
    req = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(req);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>3Dグラフィック（ドラッグで回転）</div>
      <canvas ref={canvasRef} width={320} height={240} style={{ background: '#fafafa', border: '1px solid #ccc', borderRadius: 8, cursor: 'grab' }} />
    </div>
  );
};

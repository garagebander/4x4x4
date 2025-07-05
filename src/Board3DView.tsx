import React from 'react';
import type { Board } from './Board3D';

// 簡易3Dビュー: 各セルの状態を立体的に積み上げて表示
export const Board3DView: React.FC<{ board: Board }> = ({ board }) => {
  // x, yごとにz=0→z=3まで上から積み上げて表示
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>3Dビュー</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 40px)', gap: 8 }}>
        {[0,1,2,3].map(y =>
          [0,1,2,3].map(x => (
            <div key={y + '-' + x} style={{ height: 80, position: 'relative' }}>
              {[3,2,1,0].map(z => {
                const cell = board[z][y][x];
                return (
                  <div
                    key={z}
                    style={{
                      width: 36,
                      height: 16,
                      borderRadius: 8,
                      background: cell === 1 ? '#1976d2' : cell === 2 ? '#d32f2f' : '#eee',
                      color: cell ? '#fff' : '#aaa',
                      position: 'absolute',
                      left: 0,
                      bottom: (3-z)*18,
                      textAlign: 'center',
                      fontSize: 14,
                      border: '1px solid #aaa',
                      boxSizing: 'border-box',
                    }}
                  >
                    {cell === 1 ? '●' : cell === 2 ? '○' : ''}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        各マスの下から上(z=0→z=3)に積み上げて表示
      </div>
    </div>
  );
};

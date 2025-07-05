import React from 'react';

export type Player = 1 | 2 | null;

export type Board = Player[][][]; // [z][y][x]

export interface BoardProps {
  board: Board;
  onCellClick: (z: number, y: number, x: number) => void;
  canPlace?: (z: number, y: number, x: number) => boolean;
}

export const Board3D: React.FC<BoardProps> = ({ board, onCellClick, canPlace }) => {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {board.map((layer, z) => (
        <div key={z} style={{ display: 'inline-block' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>z={z}</div>
          <table style={{ borderCollapse: 'collapse', margin: 4 }}>
            <tbody>
              {layer.map((row, y) => (
                <tr key={y}>
                  {row.map((cell, x) => {
                    const placeable = canPlace ? canPlace(z, y, x) : true;
                    return (
                      <td
                        key={x}
                        style={{
                          width: 32,
                          height: 32,
                          border: '1px solid #888',
                          textAlign: 'center',
                          cursor: cell === null && placeable ? 'pointer' : 'default',
                          background:
                            cell === 1
                              ? '#1976d2'
                              : cell === 2
                              ? '#d32f2f'
                              : placeable
                              ? '#fff'
                              : '#bbb', // 置けないマスは灰色
                          color: cell ? '#fff' : '#000',
                          fontWeight: 'bold',
                          fontSize: 20,
                        }}
                        onClick={() => cell === null && placeable && onCellClick(z, y, x)}
                      >
                        {cell === 1 ? '●' : cell === 2 ? '○' : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

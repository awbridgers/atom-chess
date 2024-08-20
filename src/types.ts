import {Color, Move, PieceSymbol, Square} from 'chess.js';

export type PieceInfo = {
  type: PieceSymbol;
  color: Color;
  square: Square;
};

export type EvalResults = {
  score: number | null;
  variation: string[]; 
  mate: number | null;
  fen: string;
}

export type Variation = {
  line: {move: string, fen: string|null, to: Square|null, from: Square|null}[]
  score: string
}

export type MoveHistory = {
  from: Square | null,
  to: Square | null,
  color: Color | null,
  fen: string
  san: string;
  variation: MoveHistory[]
}

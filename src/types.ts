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

export type MoveHistory  = (Move & {comments? : string})
export type ResultType = '1-0'|'0-1'|'1/2-1/2'|'*'

export type Game = {
    black: string;
    white: string;
    result: ResultType;
    pgn: string;
    key: string;
    date: Date;
    dateAdded: Date;
  }

export type OrderedGame = Game & {order: number};
export type GameDetails = {
  white: string;
  whiteElo: string;
  black: string;
  blackElo: string;
  result: ResultType;
  date: string;
  event: string;
  additional: [string,string][];
}
export type palette = {
  light: string;
  dark: string;
  selected: string;
  legal: string;
  bestMove: string;
  background: string;
  highlighted: string;
  previousMove: string;
  text: string;
}
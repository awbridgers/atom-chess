import { Color, PieceSymbol } from 'chess.js';
import blackBishop from '../images/blackBishop.png'
import blackKing from '../images/blackKing.png'
import blackKnight from '../images/blackKnight.png'
import blackQueen from '../images/blackQueen.png'
import blackRook from '../images/blackRook.png'
import blackPawn from '../images/blackPawn.png'
import whiteBishop from '../images/whiteBishop.png'
import whiteKing from '../images/whiteKing.png'
import whiteKnight from '../images/whiteKnight.png'
import whiteQueen from '../images/whiteQueen.png'
import whiteRook from '../images/whiteRook.png'
import whitePawn from '../images/whitePawn.png'

export const getPiece = (piece: PieceSymbol, color: Color):string =>{
  if(color === 'b'){
    if(piece === 'k') return blackKing;
    if(piece === 'q') return blackQueen;
    if(piece === 'r') return blackRook;
    if(piece === 'b') return blackBishop;
    if(piece === 'n') return blackKnight;
    if(piece === 'p') return blackPawn;
  }else if(color === 'w'){
    if(piece === 'k') return whiteKing;
    if(piece === 'q') return whiteQueen;
    if(piece === 'r') return whiteRook;
    if(piece === 'b') return whiteBishop;
    if(piece === 'n') return whiteKnight;
    if(piece === 'p') return whitePawn;
  }
  throw new Error('invalid piece')
}
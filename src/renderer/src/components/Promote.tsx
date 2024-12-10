import {Color, PieceSymbol, Square} from 'chess.js';
import styled from 'styled-components';

import blackQueen from '../assets/images/blackQueen.png';
import blackRook from '../assets/images/blackRook.png';
import blackBishop from '../assets/images/blackBishop.png';
import blackKnight from '../assets/images/blackKnight.png';
import whiteQueen from '../assets/images/whiteQueen.png';
import whiteRook from '../assets/images/whiteRook.png';
import whiteBishop from '../assets/images/whiteBishop.png';
import whiteKnight from '../assets/images/whiteKnight.png';
import {useMemo} from 'react';

type Props = {
  color: Color;
  promote: (
    from: Square,
    to: Square,
    promo: Exclude<PieceSymbol, 'p' | 'k'>
  ) => void;
  from: Square;
  to: Square;
  height: number;
  flipped: boolean;
};
const pieces: {promo: Exclude<PieceSymbol, 'p' | 'k'>, white: string, black: string}[] = [
  {promo: 'q', white: whiteQueen, black: blackQueen},
  {promo: 'r', white: whiteRook, black: blackRook},
  {promo: 'b', white: whiteBishop, black: blackBishop},
  {promo: 'n', white: whiteKnight, black: blackKnight},
];

const Promote = ({height, color, promote, from, to, flipped}: Props) => {
  const layout = useMemo(() => {
    return flipped && color === 'w' || (!flipped && color === 'b') ? [...pieces].reverse() : pieces;
  }, [flipped]);
  const handleClick = (e:React.MouseEvent<HTMLDivElement, MouseEvent>, piece: Exclude<PieceSymbol, 'p' | 'k'>)=>{
    e.stopPropagation();
    promote(from, to , piece);
  }
  return (
    <Container $flipped={flipped} $target={to}>
      {layout.map((piece, i) => {
        return (
          <Button key={i} $height={height} onClick = {(e)=>handleClick(e, piece.promo)}>
            <img src={color === 'w' ? piece.white : piece.black} />
          </Button>
        );
      })}
    </Container>
  );
};
const Container = styled.div<{$flipped: boolean; $target: Square}>`
  display: flex;
  flex-flow: column nowrap;
  position: absolute;
  top: ${(props) =>
    (!props.$flipped && props.$target[1] === '8') ||
    (props.$flipped && props.$target[1] === '1')
      ? '0px'
      : 'auto'};
  bottom: ${(props) =>
    (props.$flipped && props.$target[1] === '8') ||
    (!props.$flipped && props.$target[1] === '1')
      ? '0px'
      : 'auto'};
  z-index: 5;
`;
const Button = styled.div<{$height}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  height: ${(props) => props.$height}px;
  width: ${(props) => props.$height}px;
  background-color: #3d3d3dcf;
  &:hover {
    background-color: yellow;
  }
  img {
    width: 100%;
    z-index: 10;
  }
`;
export default Promote;

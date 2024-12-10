import {Color, Move, PieceSymbol, Square} from 'chess.js';
import {PieceInfo} from 'src/types';
import styled from 'styled-components';
import {getPiece} from '@renderer/assets/util/getPiece';
import Promote from './Promote';
import {useMemo} from 'react';
import {ArcherContainer, ArcherElement} from 'react-archer';

type Props = {
  board: (PieceInfo | null)[][];
  white?: string;
  black?: string;
  whiteElo?: string;
  blackElo?: string;
  onClickSquare?: (id: Square) => void;
  selectedSquare?: Square | null;
  highlightedSquares?: Set<Square>;
  handleRightClick?: (id: Square) => void;
  legalMoves?: Map<Square, Move>;
  hideNumbers?: boolean;
  squareHeight: number;
  prevMove?: {to: Square | null; from: Square | null};
  promoInfo?: {to: Square; from: Square; color: Color} | null;
  flipped: boolean;
  showArrows?: boolean;
  cancelPromo?: () => void;
  promote?: (
    from: Square,
    to: Square,
    promo: Exclude<PieceSymbol, 'p' | 'k'>
  ) => void;
  bestMoves?: Map<Square, Square[]>;
};

const Board = ({
  board,
  onClickSquare,
  selectedSquare,
  highlightedSquares,
  handleRightClick,
  legalMoves,
  squareHeight,
  hideNumbers,
  prevMove,
  promoInfo,
  flipped,
  cancelPromo,
  promote,
  bestMoves,
  showArrows,
  white,
  black,
  whiteElo,
  blackElo,
}: Props) => {
  const getColor = (id) => {
    const rank = +id[1];
    const file = id.charCodeAt(0) - 97;
    if (rank % 2 === 0) {
      return file % 2 === 0 ? 'light' : 'dark';
    }
    return file % 2 === 0 ? 'dark' : 'light';
  };
  const boardOrientation = useMemo(() => {
    if (!flipped) return board;
    else {
      const reverse = [...board].reverse();
      return reverse.map((x) => [...x].reverse());
    }
  }, [board, flipped]);
  return (
    <Container>
      {white && black && <GameInfo>
        <NamesContainer style = {{width: squareHeight*8}}>
          <Name>{white}</Name> ({whiteElo}) -- <Name>{black}</Name> ({blackElo})
        </NamesContainer>
      </GameInfo>}
      {promoInfo && cancelPromo && <PromoScreen onClick={cancelPromo} />}
      <ArcherContainer
        strokeColor="#4977f75d"
        strokeWidth={3}
        svgContainerStyle={{zIndex: 4}}
        endShape={{arrow: {arrowLength: 5, arrowThickness: 5}}}
      >
        {boardOrientation.map((row, i) => (
          <Row key={i}>
            {row.map((square, j) => {
              const id = !flipped
                ? (`${String.fromCharCode(j + 97)}${8 - i}` as Square)
                : (`${String.fromCharCode(104 - j)}${i + 1}` as Square);
              return (
                <ArcherElement
                  key={id}
                  id={id}
                  relations={
                    showArrows && bestMoves && bestMoves.has(id)
                      ? [...bestMoves.get(id)!].map((x) => {
                          //console.log(id, x)
                          return {
                            targetId: x,
                            targetAnchor: 'middle',
                            sourceAnchor: 'middle',
                          };
                        })
                      : []
                  }
                >
                  <SquareWrapper
                    id={id}
                    $light={getColor(id) === 'light'}
                    $selected={id === selectedSquare}
                    $height={squareHeight}
                    onClick={() => (onClickSquare ? onClickSquare(id) : {})}
                    onContextMenu={() =>
                      handleRightClick ? handleRightClick(id) : {}
                    }
                  >
                    {highlightedSquares && highlightedSquares.has(id) && (
                      <Highlighted />
                    )}
                    {prevMove &&
                      (id === prevMove.to || id === prevMove.from) && (
                        <PreviousMove />
                      )}
                    {legalMoves && legalMoves.has(id) && <LegalMove />}
                    {square && (
                      <img
                        src={getPiece(square.type, square.color)}
                        className="image"
                      />
                    )}
                    {!hideNumbers && i === 7 && (
                      <div className="file">{id[0]}</div>
                    )}
                    {!hideNumbers && j === 0 && (
                      <div className="rank">{id[1]}</div>
                    )}
                    {promoInfo && promote && promoInfo.to === id && (
                      <Promote
                        color={promoInfo.color}
                        from={promoInfo.from}
                        to={promoInfo.to}
                        height={squareHeight}
                        flipped={!!flipped}
                        promote={promote}
                      />
                    )}
                  </SquareWrapper>
                </ArcherElement>
              );
            })}
          </Row>
        ))}
      </ArcherContainer>
    </Container>
  );
};

export default Board;

const Container = styled.div`
  position: relative;
`;
const SquareWrapper = styled.div<{
  $light: boolean;
  $selected: boolean;
  $height: number;
}>`
  height: ${(props) => props.$height}px;
  width: ${(props) => props.$height}px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: ${(props) => (props.$light ? '#EDD6B0' : '#B88762')};
  outline: ${(props) => (props.$selected ? '4px solid yellow' : '0px')};
  outline-offset: -4px;
  .file {
    position: absolute;
    bottom: 0px;
    user-select: none;
    right: 2px;
    font-size: 14px;
  }
  .rank {
    position: absolute;
    user-select: none;
    top: 0px;
    left: 2px;
    font-size: 14px;
  }
  .image {
    width: 90%;
    z-index: 3;
  }
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
const Highlighted = styled.div`
  z-index: 2;
  background-color: rgba(255, 0, 0, 0.485);
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
`;
const PreviousMove = styled.div`
  z-index: 2;
  background-color: rgba(242, 251, 80, 0.423);
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  pointer-events: none;
`;
const LegalMove = styled.div`
  background-color: rgba(18, 255, 129, 0.548);
  border-radius: 40px;
  height: 20%;
  width: 20%;
  position: absolute;
  z-index: 4;
`;

const PromoScreen = styled.div`
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 5;
  background-color: #00000066;
`;
const GameInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const NamesContainer = styled.div`
  font-size: 20px;
  align-self: center;
  overflow: hidden;
  color: white;
  white-space: nowrap;
  margin: auto;
  text-align: center;
`;
const Name = styled.div`
  font-weight: bold;
  display: inline;
`;

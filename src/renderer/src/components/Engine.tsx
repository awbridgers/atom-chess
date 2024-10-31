import {Chess, Square} from 'chess.js';
import {useRef, useState} from 'react';
import {PieceInfo, Variation} from 'src/types';
import styled from 'styled-components';
import Board from './Board';
import {FaCaretDown, FaCaretUp, FaCog} from 'react-icons/fa';

type Props = {
  value: string;
  variations: Variation[];
  flipped: boolean;
  openOptions: () => void;
  depth: number
};

const Engine = ({value, variations, flipped, openOptions, depth}: Props) => {
  const [boardInfo, setBoardInfo] = useState<(PieceInfo | null)[][]>([]);
  const [boardCoords, setBoardCoords] = useState<number>(-1);
  const [moveSqaure, setMoveSquare] = useState<{
    to: Square | null;
    from: Square | null;
  }>({to: null, from: null});
  const [expand, setExpand] = useState<boolean[]>([false, false, false]);
  const chess = useRef(new Chess());
  const handleHover = (
    fen: string | null,
    to: Square | null,
    from: Square | null,
    index: number
  ) => {
    if (fen) {
      chess.current.load(fen);
      setBoardInfo(chess.current.board());
      setMoveSquare({to, from});
      setBoardCoords(index);
    } else {
      setBoardInfo([]);
      setBoardCoords(-1);
      setMoveSquare({to: null, from: null});
    }
  };
  return (
    <Container>
      <Evaluation>
        <div style={{minWidth: '50px', fontWeight: 'bold'}}>{value}</div>
        <div style={{fontSize: '20px'}}>depth: {depth}</div>
        <FaCog onClick={openOptions} className="buttonIcon" size={20} />
      </Evaluation>
      <VarContainer>
        {variations.map((chessLine, i) => (
          <VariationLine key={i}>
            {boardCoords === i && (
              <div
                style={{
                  position: 'absolute',
                  zIndex: 3,
                  bottom: '-250px',
                  left: '50px',
                  right: '0px',
                  margin: 'auto',
                }}
              >
                <Board
                  board={boardInfo}
                  prevMove={moveSqaure}
                  squareHeight={30}
                  hideNumbers
                  flipped={flipped}
                />
              </div>
            )}
            <Score>{chessLine.score}</Score>
            <VariationPGN $expand={expand[i]}>
              {chessLine.line.map((line, j) => (
                <Move
                  onMouseLeave={() => handleHover(null, null, null, -1)}
                  onMouseOver={() =>
                    handleHover(line.fen, line.to, line.from, i)
                  }
                  key={j}
                >
                  {line.move}
                </Move>
              ))}
            </VariationPGN>
            {expand[i] ? (
              <FaCaretUp
                onClick={() =>
                  setExpand((prev) =>
                    prev.map((x, index) => (index === i ? false : x))
                  )
                }
              />
            ) : (
              <FaCaretDown
                onClick={() =>
                  setExpand((prev) =>
                    prev.map((x, index) => (index === i ? true : x))
                  )
                }
              />
            )}
          </VariationLine>
        ))}
      </VarContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  color: white;
  background-color: #1b1b1b;
  font-family: Arial, Helvetica, sans-serif;
  border: 2px solid white;
  box-sizing: border-box;
  .buttonIcon {
    color: #a3a3a3;
    cursor: pointer;
  }
  .buttonIcon:hover {
    color: #ffffff;
  }
`;
const Evaluation = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
  font-size: 40px;
  background-color: #1a1a1a;
`;
const VarContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border-top: 1px solid white;
`;
const VariationLine = styled.div`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding: 2px 0px;
  border-bottom: 1px solid white;
`;
const Move = styled.div`
  display: inline-block;
  white-space: noWrap;
  padding: 3px;
  font-size: 14px;
  cursor: default;
`;
const Score = styled.div`
  padding: 0px 5px;
  font-weight: bold;
`;
const VariationPGN = styled.div<{$expand: boolean}>`
  display: flex;
  flex-flow: ${(props) => (props.$expand ? 'row wrap' : 'row nowrap')};
  flex: 1;
  overflow: hidden;
  position: relative;
`;
export default Engine;

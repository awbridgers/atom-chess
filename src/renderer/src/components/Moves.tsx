import {Move} from 'chess.js';
import {ReactElement, useEffect, useMemo, useRef} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import {MoveHistory} from 'src/types';
import styled from 'styled-components';

type Props = {
  moveList: MoveHistory[];
  currentMove: number;
  jump: (index) => void;
};

const Moves = ({moveList, currentMove, jump}: Props) => {
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView();
    }
  }, [currentMove]);
  const focusRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => {
    const res: ReactElement[] = [];
    for (let i = 0; i < moveList.length; i += 2) {
      res.push(
        <Line key={i} ref={Math.floor(currentMove / 2) === i ? focusRef : null}>
          <MoveNumber>{Math.floor(i / 2) + 1}</MoveNumber>
          <HalfMove $highlighted={i === currentMove} onClick={() => jump(i)}>
            {moveList[i].san}
          </HalfMove>
          {moveList[i + 1] && (
            <HalfMove
              $highlighted={i + 1 === currentMove}
              onClick={() => jump(i + 1)}
            >
              {moveList[i + 1].san}
            </HalfMove>
          )}
        </Line>
      );
    }
    return res;
  }, [moveList, currentMove, jump]);
  return (
    <Container>
      <Scrollbars
        renderView={(props) => (
          <div
            {...props}
            style={{
              position: 'absolute',
              inset: '0px',
              overflowY: 'scroll',
              marginRight: '-17px',
              marginBottom: '-17px',
              paddingTop: '10px'
            }}
          />
        )}
      >
        {data}
      </Scrollbars>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  height: 100%;
  background-color: #1b1b1b;
  flex-flow: column;
  width: 100%;
  overflow-x: hidden;
`;
const Line = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  color: white;
  overflow-x: hidden;
`;
const HalfMove = styled.div<{$highlighted: boolean}>`
  display: flex;
  justify-content: flex-start;
  flex: 1;
  font-size: 24px;
  margin: 0px 5px;
  background-color: ${(props) => (props.$highlighted ? '#529aff4d' : 'none')};
  cursor: pointer;
  &:hover {
    background-color: #529affc9;
  }
`;
const MoveNumber = styled.div`
  padding: 10px 0px;
  width: 25px;
  display: flex;
  justify-content: center;
  font-size: 16px;
  background-color: #303030;
`;

export default Moves;

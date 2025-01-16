import {ReactElement, useEffect, useMemo, useRef, useState} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import {MoveHistory} from 'src/types';
import styled from 'styled-components';
import ContextMenu from './ContextMenu';
import AddComment from './AddComment';
import {clr} from '../assets/palette'

type Props = {
  moveList: MoveHistory[];
  currentMove: number;
  jump: (index: number, getEval: boolean) => void;
  addComment: (index:number, comment:string) => void;
  deleteComment: (index: number) =>void;
  blackFirst? : boolean
};

const Moves = ({moveList, currentMove, jump, addComment, deleteComment}: Props) => {
  const [menuIndex, setmenuIndex] = useState<number>(-1);
  const [showAddComment, setShowAddComment] = useState<number>(-1);
  const [showDeleteComment, setShowDeleteComment] = useState<number>(-1)
  const focusRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<Scrollbars>(null);
  const menuButtons = useMemo(() => {
    return [
      {
        name: 'Add/Edit Comment',
        onClick: () => setShowAddComment(menuIndex),
      },
      {name: 'Delete Comment', onClick: () => setShowDeleteComment(menuIndex), disabled: menuIndex < 0 || !moveList[menuIndex].comments},
    ];
  }, [menuIndex, moveList]);
  const data = useMemo(() => {
    const res: ReactElement[] = [];
    const blackFirst = moveList.length && moveList[0].color === 'b';
    for (let i = blackFirst ? -1: 0; i < moveList.length; i += 2) {
      res.push(
        <Line
          key={i}
          ref={currentMove === i || currentMove === i + 1 ? focusRef : null}
        >
          <MoveNumber>{Math.floor(i / 2) + 1}</MoveNumber>
          {i>=0 ?
          <HalfMove onContextMenu={() => setmenuIndex(i)}>
            {menuIndex === i && (
              <ContextMenu items={menuButtons} exit={() => setmenuIndex(-1)} />
            )}
            <San $highlighted={i === currentMove} onClick={() => jump(i, true)}>
              {moveList[i].san}
            </San>
            {moveList[i].comments && <Comment>{moveList[i].comments}</Comment>}
          </HalfMove> :
          <HalfMove>
            <San $highlighted = {false}>...</San>
          </HalfMove>
    }
          {moveList[i + 1] && (
            <HalfMove onContextMenu={() => setmenuIndex(i + 1)}>
              {menuIndex === i + 1 && (
                <ContextMenu items={menuButtons} exit={() => setmenuIndex(-1)} />
              )}
              <San
                $highlighted={i + 1 === currentMove}
                onClick={() => jump(i + 1, true)}
              >
                {moveList[i + 1].san}
              </San>
              {moveList[i + 1].comments && (
                <Comment>{moveList[i + 1].comments}</Comment>
              )}
            </HalfMove>
          )}
        </Line>
      );
    }
    return res;
  }, [moveList, currentMove, jump, menuIndex, menuButtons]);
  const handleDelete = (i: number)=>{
    deleteComment(i);
    setShowDeleteComment(-1)
  }
  const handleAdd = (i:number, comment: string)=>{
    addComment(i, comment);
    setShowAddComment(-1)
  }
  useEffect(() => {
    if (focusRef.current && scrollRef.current) {
      focusRef.current.scrollIntoView({block: 'center'});
    }
  }, [currentMove]);
  return (
    <Container>
      {showAddComment >= 0 && (
        <AddComment
          message={moveList[showAddComment].comments}
          add={handleAdd}
          index={showAddComment}
          cancel={() => setShowAddComment(-1)}
        />
      )}
      {showDeleteComment >= 0 && <DeleteAlert >
        <div style = {{fontSize:'20px', fontWeight: 'bold', textAlign: 'center'}}>Are you sure you want to delete this comment?</div>
        <ButtonContainer>
          <Button onClick = {()=>handleDelete(showDeleteComment)}>Confirm</Button>
          <Button onClick = {()=>setShowDeleteComment(-1)}>Cancel</Button>
        </ButtonContainer>
        </DeleteAlert>}
      <Scrollbars
        ref={scrollRef}
        renderView={(props) => (
          <div
            {...props}
            style={{
              position: 'absolute',
              inset: '0px',
              overflowY: 'scroll',
              marginRight: '-17px',
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
  background-color: #02131B;
  flex-flow: column;
  width: 100%;
  overflow-x: hidden;
  position: relative;
`;
const Line = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  color: white;
`;
const San = styled.div<{$highlighted: boolean}>`
  display: flex;
  justify-content: flex-start;
  flex-flow: column;
  font-size: 24px;
  padding: 0px 5px;
  font-weight: bold;
  background-color: ${(props) => (props.$highlighted ? '#119298' : 'none')};
  cursor: pointer;
  &:hover {
    background-color: #82C3B3;
  }
`;
const HalfMove = styled.div`
  width: 46%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: stretch;
  padding: 5px 0px;
  position: relative;
`;
const MoveNumber = styled.div`
  padding: 10px 0px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  align-self: stretch;
  font-size: 16px;
  background-color: ${clr.background};
  width: 8%;
`;
const Comment = styled.div`
  font-size: 10px;
  overflow: hidden;
  max-height: 100px;
  padding: 2px 5px;
  color: #FABD3A;
`;

const DeleteAlert = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  min-height: 100px;
  background-color: #D03731;
  justify-content: space-between;
  z-index: 10;
  display: flex; 
  flex-flow: column nowrap;
  align-items: center;
  padding: 5px;
  border-radius: 8px;
  color: white;
`
const Button = styled.button`
  height: 30px;
  width: 75px;
  border-radius: 8px;
  font-size: 18px;
  &:hover{
    background-color: #c9c9c9;
  }
`
const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-around;
  align-items: center;
`
export default Moves;

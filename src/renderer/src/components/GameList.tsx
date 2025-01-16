import {Game, OrderedGame} from 'src/types';
import styled from 'styled-components';
import Scrollbars from 'react-custom-scrollbars-2';
import {useEffect, useState} from 'react';
import Alert from './Alert';

type Props = {
  list: Game[];
  close: () => void;
  open: (pos: string, key: string) => void;
  deleteGame: (key: string) => void;
};

type Sort = 'order'|'result'|'white'|'black'

const GameList = ({list, open, close, deleteGame}: Props) => {
  const [selected, setSelected] = useState<Game | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [sortedList, setSortedList] = useState<OrderedGame[]>(list.map((x,i)=>({...x,order: i})))
  const [sortType, setSortType] = useState<Sort>('order')
  const [sortDecreasing, setSortDecreasing] = useState<boolean>(true);
  const handleDelete = ()=>{
    if(selected){
      deleteGame(selected.key);
      setShowDeleteAlert(false);
      setSelected(null)
    } 
  }
  const handleOpen = () =>{
    if(selected){
      open(selected.pgn,selected.key);
    }
  }
  const sortList = (type: Sort)=>{
    //if we click on the same sort while the list is incrseasing, return to defualt sort
    if((type === sortType) && !sortDecreasing){
      //revert to default sort
      setSortType('order');
      setSortDecreasing(true);
      setSortedList(prev=>[...prev].sort((a,b)=>a.order - b.order))
    }else if(type === sortType){
      setSortDecreasing(false);
      setSortedList(prev=>[...prev].reverse())
    }else{
      setSortType(type);
      setSortDecreasing(true);
      setSortedList(prev=>[...prev].sort((a,b)=>a[type] > b[type] ? 1 : b[type] > a[type] ?  -1 : 0))
      
    }
  }
useEffect(()=>{
  //change the sort
}, [sortType, sortDecreasing])
  return (
    <Container>
      {showDeleteAlert && (
        <Alert
          title="Delete Game?"
          body="Are you sure you want to remove this game from the list?"
          onAccept={handleDelete}
          onCancel={()=>setShowDeleteAlert(false)}
          bgColor = {'#D03731'}
          confirm
        />
      )}
      <Scrollbars style = {{flex:1}}>
      <Table>
        <tbody>
          <tr>
            <Header onClick = {()=>sortList('order')}>No.</Header>
            <Header onClick = {()=>sortList('white')}>White</Header>
            <Header onClick = {()=>sortList('black')}>Black</Header>
            <Header onClick = {()=>sortList('result')}>Result</Header>
          </tr>
       
            {sortedList.map((game) => (
              <Row
                key={game.key}
                onClick={() => setSelected(!selected ? game : selected.key ===game.key ? null : game)}
                $highlighted={selected ? game.key === selected.key : false}
              >
                <Section>{game.order + 1}</Section>
                <Section>{game.white}</Section>
                <Section>{game.black}</Section>
                <Section>{game.result}</Section>
              </Row>
            ))}
        </tbody>
      </Table>
      </Scrollbars>
      <ButtonContainer>
        <Button
          onClick={() => setShowDeleteAlert(true)}
          $disabled={!selected}
          disabled={!selected}
        >
          Delete
        </Button>
        <Button onClick={close}>Close</Button>
        <Button $disabled={!selected} disabled={!selected} onClick ={handleOpen} >
          Open
        </Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 80%;
  background-color: #001b75;
  justify-content: space-around;
  z-index: 10;
  padding: 5px;
  border-radius: 8px;
  color: white;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
`;
const Section = styled.td<{$title?: boolean}>`
  overflow-x: hidden;
  text-align: center;
  cursor: pointer;
  user-select: none;
  
  
`;
const Header = styled.th`
  cursor: pointer;
`;
const Row = styled.tr<{$highlighted?: boolean}>`
  background-color: ${(props) => (props.$highlighted ? '#397553' : 'none')};
  &:hover {
    background-color: ${(props) => (props.$highlighted ? 'none' : '#045858')};
  }
`;
const Table = styled.table`
  width:99%;
  border-collapse:collapse;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
const Button = styled.button<{$disabled?: boolean}>`
  height: 40px;
  width: 100px;
  margin: 5px;
  border-radius: 8px;
  font-size: 18px;
  &:hover {
    background-color: ${(props) => (props.$disabled ? 'none' : '#c9c9c9')};
  }
`;

export default GameList;

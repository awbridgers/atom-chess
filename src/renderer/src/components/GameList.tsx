import {Game} from 'src/types';
import styled from 'styled-components';
import Scrollbars from 'react-custom-scrollbars-2';
import {useState} from 'react';
import Alert from './Alert';

type Props = {
  list: Game[];
  close: () => void;
  open: (key:string) => void;
  deleteGame: (key: string) => void;
};

const GameList = ({list, open, close, deleteGame}: Props) => {
  const [selected, setSelected] = useState<Game | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  const handleDelete = ()=>{
    if(selected){
      deleteGame(selected.key);
      setShowDeleteAlert(false);
      setSelected(null)
    } 
  }
  const handleOpen = () =>{
    if(selected){
      open(selected.pgn);
    }
  }
  

  return (
    <Container>
      {showDeleteAlert && (
        <Alert
          title="Delete Game?"
          body="Are you sure you want to remove this game from the list?"
          onAccept={handleDelete}
          onCancel={()=>setShowDeleteAlert(false)}
        />
      )}
      <Body>
        <Header>
          <Section $title>No.</Section>
          <Section $title>White</Section>
          <Section $title>Black</Section>
          <Section $title>Result</Section>
        </Header>
        <Scrollbars>
          {list.map((game, i) => (
            <Row
              key={game.key}
              onClick={() => setSelected(game)}
              $highlighted={selected ? game.key === selected.key : false}
            >
              <Section>{i + 1}</Section>
              <Section>{game.white}</Section>
              <Section>{game.black}</Section>
              <Section>{game.result}</Section>
            </Row>
          ))}
        </Scrollbars>
      </Body>
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
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5px;
  border-radius: 8px;
  color: white;
`;
const Section = styled.div<{$title?: boolean}>`
  overflow-x: hidden;
  font-size: ${(props) => (props.$title ? '22px' : '18px')};
  margin: ${(props) => (props.$title ? '10px 0px' : '5px 0px')};
  font-weight: ${(props) => (props.$title ? 'bold' : 'normal')};
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`;
const Header = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  width: 100%;
`;
const Row = styled.div<{$highlighted?: boolean}>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  width: 100%;
  background-color: ${(props) => (props.$highlighted ? 'aqua' : 'none')};
  &:hover {
    background-color: ${(props) => (props.$highlighted ? 'none' : '#045858')};
  }
`;
const Body = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  flex: 1;
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

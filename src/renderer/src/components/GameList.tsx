import {Game} from 'src/types';
import styled from 'styled-components';
import Scrollbars from 'react-custom-scrollbars-2';
import {useEffect, useMemo, useState} from 'react';
import Alert from './Alert';

type Props = {
  list: Game[];
  close: () => void;
  open: (pos: string, key: string) => void;
  deleteGame: (key: string) => void;
};

type Sort = 'dateAdded' | 'result' | 'white' | 'black';

const GameList = ({list, open, close, deleteGame}: Props) => {
  const [selected, setSelected] = useState<Game | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [sortType, setSortType] = useState<Sort>('dateAdded');
  const [sortDecreasing, setSortDecreasing] = useState<boolean>(true);
  const sortedList = useMemo<Game[]>(() => {
    const newList = [...list];
    newList.sort((a, b) =>
      a[sortType] > b[sortType] ? 1 : b[sortType] > a[sortType] ? -1 : 0
    );
    if (!sortDecreasing) newList.reverse();
    return newList;
  }, [sortType, list, sortDecreasing]);

  const handleDelete = () => {
    if (selected) {
      deleteGame(selected.key);
      setShowDeleteAlert(false);
      setSelected(null);
    }
  };
  const handleOpen = () => {
    if (selected) {
      open(selected.pgn, selected.key);
    }
  };
  const sortList = (type: Sort) => {
    //if we click on the same sort while the list is incrseasing, return to default sort
    if (type === sortType && !sortDecreasing) {
      //revert to default sort
      setSortType('dateAdded');
      setSortDecreasing(true);
    } else if (type === sortType) {
      setSortDecreasing(false);
    } else {
      setSortType(type);
      setSortDecreasing(true);
    }
  };
  useEffect(() => {
    //change the sort
  }, [sortType, sortDecreasing]);
  return (
    <Container>
      {showDeleteAlert && (
        <Alert
          title="Delete Game?"
          body="Are you sure you want to remove this game from the list?"
          onAccept={handleDelete}
          onCancel={() => setShowDeleteAlert(false)}
          bgColor={'#D03731'}
          confirm
        />
      )}
      <Scrollbars style={{flex: 1}}>
        <Table>
          <thead>
            <tr>
              <Header onClick={() => sortList('dateAdded')}>Added</Header>
              <Header onClick={() => sortList('white')}>White</Header>
              <Header onClick={() => sortList('black')}>Black</Header>
              <Header onClick={() => sortList('result')}>Result</Header>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((game) => (
              <Row
                key={game.key}
                onClick={() =>
                  setSelected(
                    !selected ? game : selected.key === game.key ? null : game
                  )
                }
                $highlighted={selected ? game.key === selected.key : false}
              >
                <Section>{game.dateAdded.toLocaleDateString('en-US')}</Section>
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
        <Button $disabled={!selected} disabled={!selected} onClick={handleOpen}>
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
  position: sticky;
  top: 0px;
  background-color: #119298;
  padding: 5px;
  font-size: 18px;

`;
const Row = styled.tr<{$highlighted?: boolean}>`
  background-color: ${(props) => (props.$highlighted ? '#397553' : 'none')};
  &:hover {
    background-color: ${(props) => (props.$highlighted ? 'none' : '#045858')};
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

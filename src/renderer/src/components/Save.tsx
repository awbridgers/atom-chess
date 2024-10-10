import moment from 'moment';
import {useEffect, useState} from 'react';
import {GameDetails, ResultType} from 'src/types';
import styled from 'styled-components';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

type Props = {
  accept: (game: GameDetails) => void;
  cancel: () => void;
  white: string;
  black: string;
  whiteElo: string;
  blackElo: string;
  event: string;
  date: string;
  additional: string;
  result: ResultType;
};

const Save = ({
  accept,
  cancel,
  white,
  black,
  whiteElo,
  blackElo,
  event,
  date,
  additional,
  result,
}: Props) => {
  const [newWhite, setNewWhite] = useState<string>(white);
  const [newBlack, setNewBlack] = useState<string>(black);
  const [newResult, setNewResult] = useState<ResultType>(result);
  const [newWhiteElo, setNewWhiteElo] = useState<string>(whiteElo);
  const [newBlackElo, setNewBlackElo] = useState<string>(blackElo);
  const [newDate, setNewDate] = useState<string>(
    date || moment(new Date()).format('YYYY.MM.DD')
  );
  const [newEvent, setNewEvent] = useState<string>(event);
  const [newAdditional, setNewAdditional] = useState<string>(additional);
  const handleSave = () => {
    const date = new Date(newDate);
    if (date.toString() === 'Invalid Date') {
      console.log('Date is not valid');
    } else {
      const details: GameDetails = {
        White: newWhite,
        Black: newBlack,
        WhiteElo: newWhiteElo,
        BlackElo: newBlackElo,
        Result: newResult,
        Date: newDate,
        Event: newEvent,
        additional: newAdditional,
      };
      accept(details);
    }
  };
  return (
    <Container>
      <h3>Edit Headers and Save</h3>
      <Body>
        <Table>
          <tbody>
            <Row>
              <Header>White</Header>
              <td>
                <Input
                  value={newWhite}
                  onChange={(e) => setNewWhite(e.target.value)}
                />
              </td>
            </Row>
            <Row>
              <Header>White Elo</Header>
              <td>
                <Input
                  value={newWhiteElo}
                  onChange={(e) =>
                    setNewWhiteElo(
                      isNaN(+e.target.value) ? newWhiteElo : e.target.value
                    )
                  }
                />
              </td>
            </Row>
            <Row>
              <Header>Black</Header>
              <td>
                <Input
                  value={newBlack}
                  onChange={(e) => setNewBlack(e.target.value)}
                />
              </td>
            </Row>
            <Row>
              <Header>Black Elo</Header>
              <td>
                <Input
                  value={newBlackElo}
                  onChange={(e) =>
                    setNewBlackElo(
                      isNaN(+e.target.value) ? newBlackElo : e.target.value
                    )
                  }
                />
              </td>
            </Row>
            <Row>
              <Header>Result</Header>
              <td>
                <Dropdown
                  placeholderClassName="menu"
                  className="dropdown"
                  controlClassName='control'
                  options={['1-0', '0-1', '1/2-1/2', '*']}
                  onChange={(opt) => setNewResult(opt.value as unknown as ResultType)}
                  value={newResult}
                />
              </td>
            </Row>
            <Row>
              <Header><div>Date</div><div style = {{fontSize: '10px', margin: '0px'}}>(YYYY.MM.DD)</div></Header>
              <td>
                <Input
                  value={newDate}
                  onChange={(e) => setNewDate(prev=>(/^[\d.]*$/.test(e.target.value) ?  e.target.value : prev))}
                />
              </td>
            </Row>
            <Row>
              <Header>Event</Header>
              <td>
                <Input
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                />
              </td>
            </Row>
            <Row>
              <Header>Additional (CSV)</Header>
              <td>
                <Input
                  value={newAdditional}
                  onChange={(e) => setNewAdditional(e.target.value)}
                />
              </td>
            </Row>
          </tbody>
        </Table>
      </Body>
      <ButtonContainer>
        <Button onClick={cancel}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
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
  .dropdown {
    width: 253px;
    padding: 0px;
    font-size: 18px
  }
  .menu {
    color: black;
  }
  .control{
    padding-left: 1px;
    padding-right: 1px;
  }
`;
const Body = styled.div`
  flex: 1;
  width: 100%;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
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
const Table = styled.table`
  width: 99%;
  margin: auto;
`;
const Row = styled.tr``;
const Header = styled.td`
  font-size: 18px;
`;
const Input = styled.input`
  padding: 5px 0px;
  font-size: 18px;
  width: 250px;
`;

export default Save;

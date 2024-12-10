import Scrollbars from 'react-custom-scrollbars-2';
import {ResultType} from 'src/types';
import styled from 'styled-components';

type Props = {
  white: string;
  black: string;
  whiteElo: string;
  blackElo: string;
  event: string;
  result: ResultType;
  date: string;

  rest: [string,string][];
  close: () => void;
};

const GameHeaders = ({
  white,
  black,
  whiteElo,
  blackElo,
  close,
  result,
  event,
  rest,
  date
}: Props) => {
  return (
    <Container>
      <h3>Game Info</h3>
      <Scrollbars style={{flex: 1}}>
        <Table>
          <tbody>
            <Row>
              <Header>White:</Header>
              <Info>
                {white} ({whiteElo})
              </Info>
            </Row>
            <Row>
              <Header>Black:</Header>
              <Info>
                {black} ({blackElo})
              </Info>
            </Row>
            <Row>
              <Header>Result:</Header>
              <Info>{result}</Info>
            </Row>
            <Row>
              <Header>Date:</Header>
              <Info>{date}</Info>
            </Row>
            <Row>
              <Header>Event:</Header>
              <Info>{event}</Info>
            </Row>
            {rest.map(([header, value],i)=><Row key = {i}>
              <Header>{header}</Header>
              <Info>{value}</Info>
            </Row>)}
          </tbody>
        </Table>
      </Scrollbars>

      <Button onClick={close}>Close</Button>
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
const Table = styled.table`
  width: 99%;
  margin: auto;
`;
const Row = styled.tr``;
const Header = styled.td`
  font-size: 22px;
`;
const Info = styled.td`
  font-size: 22px;
  padding: 10px;
  line-break: anywhere;
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

export default GameHeaders;

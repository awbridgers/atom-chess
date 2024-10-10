import {useSquareSize} from '@renderer/hooks/useSquareSize';
import {useState} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import styled from 'styled-components';

type Props = {
  white: string;
  black: string;
  whiteElo: string;
  blackElo: string;
  rest?: {[key: string]: string};
  close: () => void;
};

const GameHeaders = ({
  white,
  black,
  whiteElo,
  blackElo,
  close,
  rest,
}: Props) => {
  return (
    <Container>
      <h3>Game Info</h3>
        <Scrollbars style = {{flex:1}}>
          <Table>
            <tbody>
              <Row>
                <Header>White:</Header>
                <Info>{white} ({whiteElo})</Info>
              </Row>
              <Row>
                <Header>Black:</Header>
                <Info>{black} ({blackElo})</Info>
              </Row>
              {rest && Object.keys(rest).map((header,i)=>(
                <Row key = {i}>
                  <Header>{header}:</Header>
                  <Info>{rest[header]}</Info>
                </Row>
            
            ))}
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
const NamesContainer = styled.div`
  font-size: 24px;
  align-self: center;
  color: white;
`;
const Name = styled.div`
  font-weight: bold;
  font-size: 24px;
  display: inline;
`;
const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
const Table = styled.table`
width: 99%;
margin: auto;
`
const Row = styled.tr`

`
const Header = styled.td`
  font-size: 22px;

`
const Info = styled.td`
font-size: 22px;
padding: 10px;
line-break: anywhere;
`
const Body = styled.div`
  display: flex;
  justify-content: center;
  height: 400px;
  flex:1;
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
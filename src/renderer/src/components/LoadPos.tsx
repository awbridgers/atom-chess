import {useState} from 'react';
import styled from 'styled-components';
// import {clr} from '../assets/palette'

type Props = {
  load: (pos: string,type: 'fen'|'pgn', key: string) => void;
  cancel: ()=>void;
};

const LoadPos = ({load,cancel}: Props) => {
  const [fen, setFen] = useState<string>('');
  const [pgn, setPgn] = useState<string>('');
  const loadPosition = ()=>{
    if(pgn){
      load(pgn, 'pgn','')
    }else if(fen){
      load(fen, 'fen','')
    }
  }
  return (
    <Container>
      <FEN
        type="text"
        placeholder="Enter FEN"
        value={fen}
        onChange={(e) => setFen(e.target.value)}
      />
      <PGN
        value={pgn}
        placeholder="Enter PGN"
        onChange={(e) => setPgn(e.target.value)}
      />
      <ButtonContainer>
      <Button onClick={()=>load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'fen', '')}>New</Button>
      <Button onClick = {loadPosition}>Load</Button>
      <Button onClick = {cancel}>Cancel</Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  height: 300px;
  width: 100%;
  display: flex;
  flex-flow: column;
  background-color: #001b75;
`;
const FEN = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: 20px;
  margin: 5px 0px;
`;
const PGN = styled.textarea`
  width: 100%;
  flex-grow: 1;
  resize: none;
  font-size: 20px;
  box-sizing: border-box;
`;
const Button = styled.button`
   height: 40px;
  width: 100px;
  margin: 5px;
  border-radius: 8px;
  font-size: 18px;
  &:hover{
    background-color: #c9c9c9;
  }
  `;
  const ButtonContainer = styled.div`
  display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: center;
  `

export default LoadPos;

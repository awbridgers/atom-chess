import {ResultType} from 'src/types';
import styled from 'styled-components';
import {clr} from '../assets/palette';
import {FaTriangleExclamation} from 'react-icons/fa6';
import { useState } from 'react';
import ContextMenu from './ContextMenu';

type Props = {
  white: string;
  black: string;
  whiteElo: string;
  blackElo: string;
  result: ResultType;
  squareSize: number;
  canUpdate: boolean;
  showUpdateAlert: React.Dispatch<React.SetStateAction<boolean>>
  hideUpdate: ()=>void;
};

const Banner = ({
  white,
  black,
  result,
  squareSize,
  whiteElo,
  blackElo,
  canUpdate,
  showUpdateAlert,
  hideUpdate
}: Props) => {
  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const hideAlert = ()=>{
    setOpenMenu(false)
    hideUpdate();
  }
  
  return (
    <Container $width={squareSize * 8 + 20 + 350}>
      <Spacer />
      <NameContainer
        $width={squareSize * 8}
        $length={`${white}${black}`.length}
      >
        <span>
          <NameInfo><Name>{white}</Name> ({whiteElo})</NameInfo>
          {result && <Result>{result}</Result>} 
          <NameInfo><Name>{black}</Name> ({blackElo}</NameInfo>
          )
        </span>
      </NameContainer>
      <UpdateContainer>
      {canUpdate && (
        <Update onClick = {()=>showUpdateAlert(true)} onContextMenu={()=>setOpenMenu(true)}>
          <FaTriangleExclamation size={25} color={clr.selected} style={{margin: '5px'}} /> Update Available
          <>{openMenu && <ContextMenu items = {[{name: 'Hide', onClick : hideAlert}]} exit = {()=>setOpenMenu(false)}/>}</>
        </Update>
      )}
      </UpdateContainer>
    </Container>
  );
};
const Container = styled.div<{$width: number}>`
  min-height: 50px;
  width: ${(props) => props.$width}px;
  display: flex;
  background-color: ${clr.background};
`;
const Spacer = styled.div`
  width: 20px;
`;
const NameContainer = styled.div<{$width: number; $length: number}>`
  width: ${(props) => props.$width}px;
  font-size: ${(props) => (props.$length > 35 ? '14px' : '20px')};
  display: flex;
  overflow: hidden;
  color: ${clr.text};
  white-space: nowrap;
  align-items: center;
  justify-content: center;
`;
const Name = styled.div`
  font-weight: bold;
  display: inline;
`;
const NameInfo = styled.div`
  padding: 0px 2px;
  display: inline;
`
const Result = styled.div`
  font-weight: bold;
  color: #fffc77;
  display: inline;
  margin: 0px 5px;
`;
const UpdateContainer = styled.div`
  width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Update = styled.button`
  display: flex;
  justify-content: center;
  position: relative;
  background-color: ${clr.dark};
  border: 0px;
  align-items: center;
  cursor: pointer;
  &:hover{
    background-color: #49966b;
  }
  font-size: 16px;
  font-weight: bold;
`
export default Banner;

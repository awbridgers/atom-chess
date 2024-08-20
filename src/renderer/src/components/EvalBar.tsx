import { useMemo } from 'react';
import styled from 'styled-components'

type Props = {
  height: number;
  score: number;
}

const EvalBar = ({height, score}:Props) => {
  const fillerHeight = useMemo(()=>{
    if(score >= 10) return 20;
    if(score <=-10) return 0;
    return score + 10
  },[score])
  return (
    <Container $height = {height}>
      <Filler $height = {(fillerHeight/20)*100}/>
      <MidLine />
    </Container>
  )
}
const Container = styled.div<{$height:number}>`
  background-color: rgba(71, 71, 71, 0.7);
  height: ${(props)=>props.$height}px;
  width: 20px;
  border: 2px solid black;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
`
const Filler = styled.div<{$height:number}>`
  background-color: white;
  width: 20px;
  height: ${(props)=>props.$height}%;
  transition:  height linear 1s;
`
const MidLine = styled.div`
  width: 20px;
  height: 5px;
  background-color: rgba(156, 3, 3, 0.5);
  position: absolute;
  margin: auto;
  left:0;
  right:0;
  top:0;
  bottom:0;
  z-index: 2;
`
export default EvalBar
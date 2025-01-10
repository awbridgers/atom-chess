import { useState } from 'react'
import styled from 'styled-components'
import {clr} from '../assets/palette'
type Props = {
  message?: string
  add : (index: number, comment: string)=>void;
  index: number;
  cancel: ()=>void;
}

const AddComment = ({message, add, index, cancel}:Props) => {
  const [comment, setComment] = useState<string>(message ? message : '')
  return (
    <Container>
      <div style = {{fontSize: '18px'}}>Comment</div>
      <TextBox value = {comment} onChange={(e)=>setComment(e.target.value)}/>
      <ButtonContainer>
        <Button onClick = {()=>add(index, comment)}>Submit</Button>
        <Button onClick = {cancel}>Cancel</Button>
      </ButtonContainer>
    </Container>
  )
}

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 200px;
  background-color: #119298;
  justify-content: center;
  z-index: 10;
  display: flex; 
  flex-flow: column nowrap;
  align-items: center;
  padding: 5px;
  border-radius: 8px;
  color: ${clr.selected};
`;
const TextBox = styled.textarea`
  width: 90%;
  flex: 1;
  resize: none;
  border-radius: 8px;
  font-size: 18px;
`;
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
  justify-content: center;
  align-items: center;
`

export default AddComment
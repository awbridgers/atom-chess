import styled from 'styled-components'

type Props = {
  title: string;
  body: string;
  confirm?: boolean;
  onAccept: ()=>void;
  onCancel: ()=> void;
  bgColor?: string;
}

const Alert = ({title, body, confirm, onAccept, onCancel, bgColor}:Props) => {
  return (
    <Container style = {{backgroundColor: bgColor ? bgColor : '#001b75'}}>
      <Title>{title}</Title>
      <Body>{body}</Body>
      <ButtonContainer>
        <Button onClick = {onAccept}>{`${confirm ? 'Yes': 'OK'}`}</Button>
        {confirm && <Button onClick = {onCancel}>Cancel</Button>}
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
  justify-content: space-around;
  z-index: 10;
  display: flex; 
  flex-flow: column nowrap;
  align-items: center;
  padding: 5px;
  border-radius: 8px;
  color: white;
  `;
const Title = styled.div`
  font-size: 24px;
  text-align: center;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
`
const Button = styled.button`
  height: 30px;
  width: 75px;
  border-radius: 8px;
  font-size: 18px;
  margin: 10px;
  &:hover{
    background-color: #c9c9c9;
  }
`
const Body = styled.div`
  font-size: 20px;
  text-align: center;
`
const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  align-items: center;
`
export default Alert
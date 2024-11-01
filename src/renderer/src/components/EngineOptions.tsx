import styled from 'styled-components';
import Switch from 'react-switch';
import {FaPlusSquare, FaMinusSquare} from 'react-icons/fa';
type Props = {
  active: boolean;
  setActive: (x: boolean) => void;
  depth: number;
  setDepth: (x: number) => void;
  exit: () => void;
};

const EngineOptions = ({active, setActive, depth, setDepth, exit}: Props) => {
  const handleDepthChange = (newDepth: number) => {
    if (newDepth <= 20 && newDepth >= 1) {
      setDepth(newDepth);
    }
  };
  return (
    <Container>
      <div>
        <h2>Engine Options</h2>
      </div>
      <Body>
        <Line>
          <div style={{fontSize: '25px'}}>Engine: </div>
          <Switch
            width={70}
            checked={active}
            onChange={(x) => setActive(x)}
            checkedIcon={<Icon>ON</Icon>}
            uncheckedIcon={<Icon>OFF</Icon>}
          />
        </Line>
        <Line>
          <div style={{fontSize: '25px'}}>Depth: </div>
          <div
            style={{display: 'flex', alignItems: 'center', fontSize: '20px'}}
          >
            <FaMinusSquare
              size={30}
              className="buttonIcon"
              onClick={() => handleDepthChange(depth - 1)}
            />
            <div style = {{minWidth: '25px', textAlign: 'center'}}>{depth}</div>
            <FaPlusSquare
              size={30}
              className="buttonIcon"
              onClick={() => handleDepthChange(depth + 1)}
            />
          </div>
        </Line>
      </Body>
      <ButtonContainer>
        <Button onClick={exit}>Done</Button>
      </ButtonContainer>
    </Container>
  );
};

export default EngineOptions;

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
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
  .buttonIcon {
    color: #a3a3a3;
    margin: 5px;
    cursor: pointer;
    user-select: none;
  }
  .buttonIcon:hover {
    color: #ffffff;
  }
`;
const Body = styled.div`
  display: flex;
  flex-flow: column;
  flex: 1;
  width: 100%;
  align-items: center;
`;
const Line = styled.div`
  display: flex;
  flex-flow: row;
  width: 50%;
  justify-content: space-around;
  align-items: center;
  margin: 20px;
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
const Icon = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`;

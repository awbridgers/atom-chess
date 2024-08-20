import styled from 'styled-components';
import {FaRetweet, FaPlus, FaDatabase, FaArrowCircleUp} from 'react-icons/fa';

type Props = {
  flipBoard: () => void;
  setupGame: () => void;
  showArrows: boolean;
  toggleShowArrows: () => void;
};

const Menu = ({flipBoard, setupGame, showArrows, toggleShowArrows}: Props) => {
  return (
    <Container>
      <Button title="Flip Board" onClick={flipBoard}>
        <FaRetweet size={40} className="buttonIcon" />
      </Button>
      <Button title="Setup Game" onClick={setupGame}>
        <FaPlus size={40} className="buttonIcon" />
      </Button>
      <Button title="import Database">
        <FaDatabase size={40} className="buttonIcon" />
      </Button>
      <Button title="Toggle Arrows" onClick = {toggleShowArrows}>
        <FaArrowCircleUp
          size={40}
          className="buttonIcon"
          style={{color: showArrows ? 'green' : '#a3a3a3'}}
        />
      </Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;
const Button = styled.button`
  cursor: pointer;
  background-color: #000000;
  border: 0px;
  .buttonIcon {
    color: #a3a3a3;
  }
  .buttonIcon:hover {
    color: #ffffff;
  }
`;

export default Menu;

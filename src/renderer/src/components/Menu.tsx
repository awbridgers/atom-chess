import styled from 'styled-components';
import {
  FaRetweet,
  FaPlus,
  FaDatabase,
  FaArrowCircleUp,
  FaSave,
  FaInfoCircle,
} from 'react-icons/fa';
import {useState} from 'react';
import Alert from './Alert';
import { FaFolder, FaFolderOpen } from 'react-icons/fa6';

type Props = {
  flipBoard: () => void;
  setupGame: () => void;
  showArrows: boolean;
  toggleShowArrows: () => void;
  saveGame: () => void;
  showGameList: ()=>void;
  showGameInfo: ()=>void;
};

const Menu = ({
  flipBoard,
  setupGame,
  showArrows,
  toggleShowArrows,
  saveGame,
  showGameList,
  showGameInfo
}: Props) => {
  const [showAlert, setShowAlert] = useState<boolean>(false);

  return (
    <Container>
      <Button title="Flip Board" onClick={flipBoard}>
        <FaRetweet size={40} className="buttonIcon" />
      </Button>
      <Button title="Setup Game" onClick={setupGame}>
        <FaPlus size={40} className="buttonIcon" />
      </Button>
      <Button title="View Game List" onClick={showGameList}>
        <FaFolderOpen size={40} className="buttonIcon" />
      </Button>
      <Button title="Save Game" onClick={saveGame}>
        <FaSave size={40} className="buttonIcon" />
      </Button>
      <Button title="Toggle Arrows" onClick={toggleShowArrows}>
        <FaArrowCircleUp
          size={40}
          className="buttonIcon"
          style={{color: showArrows ? 'green' : '#a3a3a3'}}
        />
      </Button>
      <Button title="Game Info" onClick={showGameInfo}>
        <FaInfoCircle size={35} className="buttonIcon" />
      </Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  background-color: #454545;
  justify-content: space-around;
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

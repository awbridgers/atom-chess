import styled from 'styled-components';
import {
  FaRetweet,
  FaPlus,
  FaArrowCircleUp,
  FaSave,
  FaInfoCircle,
} from 'react-icons/fa';
import { FaFolderOpen } from 'react-icons/fa6';
import {clr} from '../assets/palette'

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

  return (
    <Container>
      <Button title="Flip Board" onClick={flipBoard}>
        <FaRetweet size={37} className="buttonIcon" />
      </Button>
      <Button title="Setup Game" onClick={setupGame}>
        <FaPlus size={37} className="buttonIcon" />
      </Button>
      <Button title="View Game List" onClick={showGameList}>
        <FaFolderOpen size={37} className="buttonIcon" />
      </Button>
      <Button title="Save Game" onClick={saveGame}>
        <FaSave size={37} className="buttonIcon" />
      </Button>
      <Button title="Toggle Arrows" onClick={toggleShowArrows}>
        <FaArrowCircleUp
          size={37}
          className={showArrows ? 'buttonIconNoHighlight' : 'buttonIcon'}
          //style={{color: showArrows ? '#397553' : '#a3a3a3'}}
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
  background-color: ${clr.background};
  justify-content: space-around;
  width: 100%;
`;
const Button = styled.button`
  cursor: pointer;
  background-color: ${clr.background};
  border: 0px;
  .buttonIcon {
    color: #a3a3a3;
  }
  .buttonIcon:hover {
    color: #FFFCC6;
  }
  .buttonIconNoHighlight{
    color: #397553
  }
`;

export default Menu;

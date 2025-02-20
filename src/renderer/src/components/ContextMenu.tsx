import styled from 'styled-components';
import {clr} from '../assets/palette'

type Props = {
  items: {name: string; onClick: () => void; disabled?: boolean}[];
  exit: () => void;
};
const ContextMenu = ({exit, items}: Props) => {
  return (
    <Container onMouseLeave={exit}>
      {/* <Spacer /> */}
      <MenuContainer>
        {items.map((item, i) => (
          <MenuItem
            key={i}
            onClick={(e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              e.stopPropagation();
              if (!item.disabled) {
                item.onClick();
              }
            }}
            $disabled={!!item.disabled}
          >
            {item.name}
          </MenuItem>
        ))}
      </MenuContainer>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: absolute;
  width: 100%;
  z-index: 5;
  justify-content: space-around;
  top:min(95%, 75px);
`;
const MenuContainer = styled.div`
  background-color: ${clr.light};
  border-radius: 6px;
`;
const MenuItem = styled.div<{$disabled?: boolean}>`
  color: ${(props) => (props.$disabled ? '#7e7e7e' : 'black')};
  font-size: 20px;
  cursor: ${(props) => (props.$disabled ? 'default' : 'pointer')};
  padding: 2px 0px;
  &:hover {
    background-color: ${(props) => (props.$disabled ? 'auto' : clr.selected)};
  }
`;
const Spacer = styled.div`
  height: 30px;
  background-color: rgba(0, 0, 0, 0);
`;

export default ContextMenu;

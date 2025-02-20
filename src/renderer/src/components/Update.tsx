import styled from 'styled-components';

type Props = {
  isUpdate: boolean;
  message: string;
};

const Update = ({isUpdate, message}: Props) => {
  return <Container>{isUpdate ? <div>!Temp Message!</div> : <></>}</Container>;
};

const Container = styled.div`
  height: 50px;
`;

export default Update;

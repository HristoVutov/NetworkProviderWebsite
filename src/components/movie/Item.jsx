import styled from "styled-components";

export default styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  width: 100%;
  max-width:250px;
  background-color: #683bb7;
  color: #fff;
  margin: 15px;
  font-size: 4em;
  text-decoration: none;
  background-image: url(${props => props.url});
  background-size: cover;
`;

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Container } from 'react-bootstrap';
// import NavDropdown from 'react-bootstrap/NavDropdown';
// import Form from 'react-bootstrap/Form';
// import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import { useAppSelector  } from '../../hooks';
import { useEthers } from '@usedapp/core';
import ShortAddress from '../ShortAddress';

const NavBar = () => {
  const activeAccount = useAppSelector(state => state.account.activeAccount);
  const { activateBrowserWallet } = useEthers();

  return (
    <Container>
    <Navbar bg="transparent" expand="lg">
      <Navbar.Brand href="#home">
        <img
          src="/logo.svg"
          width="100"
          height="100"
          className="d-inline-block align-middle"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <Nav.Link href="#link">Learn</Nav.Link>
          <Navbar.Text>
            {activeAccount ? (
              <ShortAddress>{activeAccount}</ShortAddress>
            ) : (
              <Button onClick={() => activateBrowserWallet()}>Connect Wallet</Button>
            )}
          </Navbar.Text>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    </Container>
  );
};

export default NavBar;

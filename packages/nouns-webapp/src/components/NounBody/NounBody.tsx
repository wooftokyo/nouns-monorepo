import { Row, Col } from 'react-bootstrap';
import TopTorso from './TopTorso';
import Arm from './Arm';
import Torso from './Torso';
import classes from './NounBody.module.css';
import Docs from '../Docs/Docs';

const NounBody = () => {
  return (
    <Row noGutters={true}>
      <Col className={classes.body} lg={{ span: 9, offset: 3 }}>
        <Row>
          <Col lg={{ span: 9, offset: 1}} className='p-5'>
            <Docs />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
export default NounBody;

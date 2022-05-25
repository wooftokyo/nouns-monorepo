import classes from './DelegationModal.module.css';
import ReactDOM from 'react-dom';
import React from 'react';
import { XIcon } from '@heroicons/react/solid';
import { StandaloneNounCircular } from '../StandaloneNoun';
import { BigNumber } from '@ethersproject/bignumber';
import ShortAddress from '../ShortAddress';
import { useShortAddress } from '../../utils/addressAndENSDisplayUtils';
import NavBarButton, { NavBarButtonStyle } from '../NavBarButton';

export const Backdrop: React.FC<{ onDismiss: () => void }> = props => {
  return <div className={classes.backdrop} onClick={props.onDismiss} />;
};

const DelegationModalOverlay: React.FC<{
  onDismiss: () => void;
}> = props => {
  const { onDismiss } = props;

  const shortAddr = useShortAddress("0x353224270c2C9a7eCcE7d8dBA98a61587da6F50a");

  return (
    <>
      <div className={classes.closeBtnWrapper}>
        <button onClick={onDismiss} className={classes.closeBtn}>
          <XIcon className={classes.icon} />
        </button>
      </div>

      <div className={classes.modal}>
          <div className={classes.title}>
              {/* TODO this copy is state dependant */}
              <h1>Delegation</h1>
          </div>
        <div className={classes.content}>
            <p style={{fontWeight: 'medium', fontFamily: 'PT Root UI'}}>
            Noun votes are not transferable, but are <span style={{fontWeight: 'bold'}}>delegatable</span>, which means you can assign your vote to someone else as long as you own your Noun.
            </p>

            {/* Current delegate */}
            <div style={{
                borderRadius: '14px',
                backgroundColor: 'white',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div style={{
                    color: 'var(--brand-gray-light-text)',
                    fontSize: '18px',
                    marginTop: '1rem'
                }}>
                    Current
                </div>

                {/* Current delegate component */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{display: 'flex',flexDirection: 'row', fontSize: '26px'}}>
                        <ShortAddress address={"0x353224270c2C9a7eCcE7d8dBA98a61587da6F50a"} avatar={true}/>
                    </div>
                    <div style={{color: 'var(--brand-cool-light-text)', fontWeight: 'normal'}}>
                        {shortAddr}
                    </div>

                </div>
            </div>

            {/* Bottom Buttons */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
                <NavBarButton 
                    buttonText={"Close"} 
                    buttonStyle={NavBarButtonStyle.COOL_CLOSE_DELEGATE}
                />
                <NavBarButton 
                    buttonText={"Change your delegate"} 
                    buttonStyle={NavBarButtonStyle.COOL_CHANGE_DELEGATE}
                />
            </div>

        </div>
      </div>
    </>
  );
};

const DelegationModal: React.FC<{
  onDismiss: () => void;
}> = props => {
  const { onDismiss } = props;
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onDismiss={onDismiss} />,
        document.getElementById('backdrop-root')!,
      )}
      {ReactDOM.createPortal(
        <DelegationModalOverlay onDismiss={onDismiss} />,
        document.getElementById('overlay-root')!,
      )}
    </>
  );
};

export default DelegationModal;
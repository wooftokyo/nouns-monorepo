import classes from './DelegationModal.module.css';
import ReactDOM from 'react-dom';
import React, { ReactNode, useState } from 'react';
import { SwitchHorizontalIcon, XIcon } from '@heroicons/react/solid';
import ShortAddress from '../ShortAddress';
import { useShortAddress } from '../../utils/addressAndENSDisplayUtils';
import NavBarButton, { NavBarButtonStyle } from '../NavBarButton';
import { useEthers } from '@usedapp/core';
import { Trans } from '@lingui/macro';
import { set } from 'ramda';
import { FormControl } from 'react-bootstrap';
import DelegateModalEntryFrame from '../DelegateModalEntryFrame';

export const Backdrop: React.FC<{ onDismiss: () => void }> = props => {
  return <div className={classes.backdrop} onClick={props.onDismiss} />;
};

enum DelegateModalState {
  DELEGATION,
  CHANGE_DELEGATE,
  CHANGEING_DELEGATE,
  DELEGATE_CHANGED_SUCCESS,
  DELEGATE_CHANGED_FAILURES,
}

const getLocalizedTitleCopy = (state: DelegateModalState) => {
  switch (state) {
    case DelegateModalState.DELEGATION:
      return <Trans>Delegation</Trans>;
    case DelegateModalState.CHANGE_DELEGATE:
      return <Trans>Change Delegate</Trans>;
    case DelegateModalState.CHANGEING_DELEGATE:
      return <Trans>Changing...</Trans>;
    case DelegateModalState.DELEGATE_CHANGED_SUCCESS:
      return <Trans>Changed!</Trans>;
    case DelegateModalState.DELEGATE_CHANGED_FAILURES:
      return <Trans>Delegate Change Failed</Trans>;
  }
};

const getStateDependantModalContent = (state: DelegateModalState) => {
  switch (state) {
    case DelegateModalState.DELEGATION:
      return (
        <>
          <p style={{ fontWeight: 'medium', fontFamily: 'PT Root UI' }}>
            Noun votes are not transferable, but are{' '}
            <span style={{ fontWeight: 'bold' }}>delegatable</span>, which means you can assign your
            vote to someone else as long as you own your Noun.
          </p>

          {/* Current delegate */}
          <div
            style={{
              borderRadius: '14px',
              backgroundColor: 'white',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                color: 'var(--brand-gray-light-text)',
                fontSize: '18px',
                marginTop: '1rem',
              }}
            >
              Current
            </div>

            {/* Current delegate component */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', fontSize: '26px' }}>
                <ShortAddress
                  address={'0xA1c0b11B86A46885B87c7ed68b91FAa0C349e1cD' || ''}
                  avatar={true}
                />
              </div>
              <div style={{ color: 'var(--brand-cool-light-text)', fontWeight: 'normal' }}>
                0x12345678
              </div>
            </div>
          </div>
        </>
      );
    case DelegateModalState.CHANGE_DELEGATE:
      return <DelegateModalEntryFrame />;
    case DelegateModalState.CHANGEING_DELEGATE:
      return <></>;
    case DelegateModalState.DELEGATE_CHANGED_SUCCESS:
      return <></>;
    case DelegateModalState.DELEGATE_CHANGED_FAILURES:
      return <></>;
  }
};

const getNextState = (state: DelegateModalState) => {
  switch (state) {
    case DelegateModalState.DELEGATION:
      return DelegateModalState.CHANGE_DELEGATE;
    case DelegateModalState.CHANGE_DELEGATE:
      return DelegateModalState.CHANGEING_DELEGATE;
    default:
      return DelegateModalState.CHANGEING_DELEGATE;
  }
};

const DelegationModalOverlay: React.FC<{
  onDismiss: () => void;
}> = props => {
  const { onDismiss } = props;

  const { account } = useEthers();
  const [modalTitleState, setModalTitleState] = useState(DelegateModalState.DELEGATION);

  return (
    <>
      <div className={classes.closeBtnWrapper}>
        <button onClick={onDismiss} className={classes.closeBtn}>
          <XIcon className={classes.icon} />
        </button>
      </div>

      <div className={classes.modal}>
        <div className={classes.title}>
          <h1>{getLocalizedTitleCopy(modalTitleState)}</h1>
        </div>
        <div className={classes.content}>
          {getStateDependantModalContent(modalTitleState)}

          {/* Bottom Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <NavBarButton
              buttonText={'Close'}
              buttonStyle={NavBarButtonStyle.COOL_CLOSE_DELEGATE}
            />
            <NavBarButton
              buttonText={'Change your delegate'}
              buttonStyle={NavBarButtonStyle.COOL_CHANGE_DELEGATE}
              onClick={() => setModalTitleState(getNextState(modalTitleState))}
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

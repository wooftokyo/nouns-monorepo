import { isAddress } from '@ethersproject/address';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import ShortAddress from '../ShortAddress';
import classes from './DelegateModalEntryFrame.module.css';

const DelegateModalEntryFrame = () => {
  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateInputClass, setDelegateInputClass] = useState<string>("");

  useEffect(() => {
      if (delegateAddress.length === 0 ){
        setDelegateInputClass(classes.empty);
      } else {

      if (isAddress(delegateAddress)) {
        setDelegateInputClass(classes.valid);
      } else {
        setDelegateInputClass(classes.invalid);
      }
      }
  },[delegateAddress]);

  return (
    <>
      <p>
        Enter the Ethereum address or ENS name of the account you would like to delegate your votes
        to.
      </p>
      <FormControl
        className={clsx(classes.bidInput, delegateInputClass )}
        type="string"
        onChange={e => setDelegateAddress(e.target.value)}
        value={delegateAddress}
        placeholder={"0x... or ...eth"}
      />
      <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',

      }}>

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

          <div style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'right'
          }}>
              <div style={{
                  color: 'var(--brand-gray-light-text)',
              }}>Already has</div>
              <div>12 votes</div>
          </div>
      </div>
    </>
  );
};

export default DelegateModalEntryFrame;

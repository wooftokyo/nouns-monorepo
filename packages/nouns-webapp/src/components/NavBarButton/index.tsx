import classes from './NavBarButton.module.css';

export enum NavBarButtonStyle {
  COOL_INFO,
  COOL_WALLET,
  WARM_INFO,
  WARM_WALLET,
  WHITE_INFO,
  WHITE_ACTIVE,
  WHITE_ACTIVE_VOTE_SUBMIT,
  WHITE_WALLET,
  COOL_CHANGE_DELEGATE,
  COOL_CLOSE_DELEGATE,
}

interface NavBarButtonProps {
  buttonText: React.ReactNode;
  buttonIcon?: React.ReactNode;
  buttonStyle?: NavBarButtonStyle;
  onClick?: (e: any) => any;
}

export const getNavBarButtonVariant = (buttonStyle?: NavBarButtonStyle) => {
  switch (buttonStyle) {
    case NavBarButtonStyle.COOL_INFO: {
      return classes.coolInfo;
    }
    case NavBarButtonStyle.COOL_WALLET: {
      return classes.coolWallet;
    }
    case NavBarButtonStyle.COOL_CHANGE_DELEGATE: {
      // TODO change this CSS classname
      return classes.coolDark;
    }
    case NavBarButtonStyle.COOL_CLOSE_DELEGATE: {
      return classes.coolCloseDelegate;
    }
    case NavBarButtonStyle.WARM_INFO: {
      return classes.warmInfo;
    }
    case NavBarButtonStyle.WARM_WALLET: {
      return classes.warmWallet;
    }
    case NavBarButtonStyle.WHITE_INFO: {
      return classes.whiteInfo;
    }
    case NavBarButtonStyle.WHITE_ACTIVE: {
      return classes.whiteActive;
    }
    case NavBarButtonStyle.WHITE_ACTIVE_VOTE_SUBMIT: {
      return classes.whiteActiveVoteSubmit;
    }
    case NavBarButtonStyle.WHITE_WALLET: {
      return classes.whiteWallet;
    }
    default: {
      return classes.info;
    }
  }
};

const NavBarButton: React.FC<NavBarButtonProps> = props => {
  const { buttonText, buttonIcon, buttonStyle, onClick } = props;

  return (
    <>
      <div
        className={`${classes.wrapper} ${getNavBarButtonVariant(buttonStyle)}`}
        onClick={onClick}
      >
        <div className={classes.button}>
          {buttonIcon && <div className={classes.icon}>{buttonIcon}</div>}
          <div>{buttonText}</div>
        </div>
      </div>
    </>
  );
};

export default NavBarButton;

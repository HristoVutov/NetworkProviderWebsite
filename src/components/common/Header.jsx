import React from "react";
import { withRouter } from "react-router-dom";
import {
  CommandBar,
  ICommandBarItemProps,
  Stack,
  mergeStyleSets,
  getTheme
} from '@fluentui/react';

const theme = getTheme();

const styles = mergeStyleSets({
  header: {
    background: theme.palette.themeDarker,
    padding: '10px 20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  title: {
    color: theme.palette.white,
    fontSize: '20px',
    fontWeight: 'bold',
    marginRight: '40px',
  }
});

const Header = ({ history }) => {
  // CommandBar items for navigation
  const _items = [
    {
      key: 'home',
      text: 'Home',
      iconProps: { iconName: 'Home' },
      onClick: () => history.push('/'),
    },
    {
      key: 'accounts',
      text: 'Accounts',
      iconProps: { iconName: 'AccountManagement' },
      onClick: () => history.push('/accounts'),
    },
    {
      key: 'strategies',
      text: 'Strategies',
      iconProps: { iconName: 'BulletedList' },
      onClick: () => history.push('/strategies'),
    },
  ];

  return (
    <Stack horizontal verticalAlign="center" className={styles.header}>
      <div className={styles.title}>Money Grow</div>
      <CommandBar
        items={_items}
        ariaLabel="Navigation menu"
        styles={{
          root: {
            backgroundColor: 'transparent',
            padding: 0,
          },
          subComponentStyles: {
            menuItem: {
              root: {
                color: theme.palette.white,
                selectors: {
                  ':hover': {
                    color: theme.palette.themePrimary,
                    backgroundColor: 'transparent',
                  },
                },
              },
              icon: {
                color: theme.palette.white,
              },
            },
          },
        }}
      />
    </Stack>
  );
};

export default withRouter(Header);
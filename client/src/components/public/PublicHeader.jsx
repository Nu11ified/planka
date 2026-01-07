/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import Logo from '../../assets/images/logo.svg?react';

import styles from './PublicHeader.module.scss';

const PublicHeader = React.memo(({ boardName, projectName }) => (
  <div className={styles.wrapper}>
    <div className={styles.logo}>
      <Logo />
    </div>
    <div className={styles.info}>
      {projectName && <span className={styles.projectName}>{projectName}</span>}
      <span className={styles.boardName}>{boardName}</span>
    </div>
  </div>
));

PublicHeader.propTypes = {
  boardName: PropTypes.string.isRequired,
  projectName: PropTypes.string,
};

PublicHeader.defaultProps = {
  projectName: undefined,
};

export default PublicHeader;

/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';

import logoSrc from '../../assets/images/logo.png';

import styles from './PublicHeader.module.scss';

const PublicHeader = React.memo(({ boardName, projectName }) => (
  <div className={styles.wrapper}>
    <div className={styles.logo}>
      <img src={logoSrc} alt="Logo" />
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

/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './PublicCard.module.scss';

const PublicCard = React.memo(({ card, labels }) => (
  <div className={styles.wrapper}>
    {labels.length > 0 && (
      <div className={styles.labels}>
        {labels.map((label) => (
          <span
            key={label.id}
            className={classNames(styles.label, styles[`label_${label.color}`])}
            title={label.name}
          >
            {label.name}
          </span>
        ))}
      </div>
    )}
    <div className={styles.name}>{card.name}</div>
    {card.description && <div className={styles.description}>{card.description}</div>}
    {card.dueDate && (
      <div className={styles.dueDate}>
        {new Date(card.dueDate).toLocaleDateString()}
      </div>
    )}
  </div>
));

PublicCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
  }).isRequired,
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default PublicCard;

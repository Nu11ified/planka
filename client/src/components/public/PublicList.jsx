/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import PublicCard from './PublicCard';

import styles from './PublicList.module.scss';

const PublicList = React.memo(({ list, cards, labelsById, labelIdsByCardId, tasksByCardId }) => {
  // Sort cards by position
  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => a.position - b.position),
    [cards],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.name}>{list.name}</span>
        <span className={styles.count}>{cards.length}</span>
      </div>
      <div className={styles.cards}>
        {sortedCards.map((card) => {
          const cardTasks = tasksByCardId[card.id] || [];
          const tasksTotal = cardTasks.length;
          const tasksCompleted = cardTasks.filter((t) => t.isCompleted).length;

          return (
            <PublicCard
              key={card.id}
              card={card}
              labels={(labelIdsByCardId[card.id] || [])
                .map((labelId) => labelsById[labelId])
                .filter(Boolean)}
              tasksTotal={tasksTotal}
              tasksCompleted={tasksCompleted}
            />
          );
        })}
      </div>
    </div>
  );
});

PublicList.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired,
    }),
  ).isRequired,
  labelsById: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
  labelIdsByCardId: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  tasksByCardId: PropTypes.objectOf(PropTypes.array),
};

PublicList.defaultProps = {
  tasksByCardId: {},
};

export default PublicList;

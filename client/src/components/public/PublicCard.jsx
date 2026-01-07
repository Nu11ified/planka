/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';

import styles from './PublicCard.module.scss';

// Format stopwatch time
const formatStopwatch = (total, startedAt) => {
  let seconds = total || 0;

  if (startedAt) {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    seconds += elapsed;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const PublicCard = React.memo(({ card, labels, tasksTotal, tasksCompleted }) => {
  const [stopwatchDisplay, setStopwatchDisplay] = useState(
    card.stopwatch ? formatStopwatch(card.stopwatch.total, card.stopwatch.startedAt) : null
  );

  // Update stopwatch every second if running
  useEffect(() => {
    if (!card.stopwatch?.startedAt) return;

    const interval = setInterval(() => {
      setStopwatchDisplay(formatStopwatch(card.stopwatch.total, card.stopwatch.startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [card.stopwatch]);

  const isStopwatchRunning = !!card.stopwatch?.startedAt;

  return (
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

      {card.description && (
        <div className={styles.hasDescription}>
          <Icon name="align left" size="small" />
        </div>
      )}

      {(card.dueDate || stopwatchDisplay || tasksTotal > 0 || card.commentsTotal > 0 || card.attachmentsTotal > 0) && (
        <div className={styles.badges}>
          {card.dueDate && (
            <div className={classNames(styles.badge, styles.dueDate, {
              [styles.overdue]: new Date(card.dueDate) < new Date() && !card.isDueCompleted,
              [styles.completed]: card.isDueCompleted,
            })}>
              <Icon name="clock outline" size="small" />
              <span>{new Date(card.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {stopwatchDisplay && (
            <div className={classNames(styles.badge, styles.stopwatch, {
              [styles.running]: isStopwatchRunning,
            })}>
              <Icon name="hourglass half" size="small" />
              <span>{stopwatchDisplay}</span>
            </div>
          )}

          {tasksTotal > 0 && (
            <div className={classNames(styles.badge, styles.tasks, {
              [styles.allComplete]: tasksCompleted === tasksTotal,
            })}>
              <Icon name="check square outline" size="small" />
              <span>{tasksCompleted}/{tasksTotal}</span>
            </div>
          )}

          {card.commentsTotal > 0 && (
            <div className={styles.badge}>
              <Icon name="comment outline" size="small" />
              <span>{card.commentsTotal}</span>
            </div>
          )}

          {card.attachmentsTotal > 0 && (
            <div className={styles.badge}>
              <Icon name="attach" size="small" />
              <span>{card.attachmentsTotal}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PublicCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    isDueCompleted: PropTypes.bool,
    stopwatch: PropTypes.shape({
      total: PropTypes.number,
      startedAt: PropTypes.string,
    }),
    commentsTotal: PropTypes.number,
    attachmentsTotal: PropTypes.number,
  }).isRequired,
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
  tasksTotal: PropTypes.number,
  tasksCompleted: PropTypes.number,
};

PublicCard.defaultProps = {
  tasksTotal: 0,
  tasksCompleted: 0,
};

export default PublicCard;

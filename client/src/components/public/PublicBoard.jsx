/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader } from 'semantic-ui-react';

import ActionTypes from '../../constants/ActionTypes';
import api from '../../api';
import PublicList from './PublicList';
import PublicHeader from './PublicHeader';

import styles from './PublicBoard.module.scss';

const PublicBoard = React.memo(() => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [t] = useTranslation();

  const publicState = useSelector((state) => state.public);
  const { board, project, lists, cards, labels, cardLabels, isFetching, error } = publicState;

  useEffect(() => {
    const fetchPublicBoard = async () => {
      dispatch({
        type: ActionTypes.PUBLIC_BOARD_FETCH,
        payload: { id },
      });

      try {
        const response = await api.getPublicBoard(id);
        dispatch({
          type: ActionTypes.PUBLIC_BOARD_FETCH__SUCCESS,
          payload: {
            board: response.item,
            project: response.included.projects[0],
            users: response.included.users,
            boardMemberships: response.included.boardMemberships,
            labels: response.included.labels,
            lists: response.included.lists,
            cards: response.included.cards,
            cardMemberships: response.included.cardMemberships,
            cardLabels: response.included.cardLabels,
            taskLists: response.included.taskLists,
            tasks: response.included.tasks,
            attachments: response.included.attachments,
            customFieldGroups: response.included.customFieldGroups,
            customFields: response.included.customFields,
            customFieldValues: response.included.customFieldValues,
          },
        });
      } catch (err) {
        dispatch({
          type: ActionTypes.PUBLIC_BOARD_FETCH__FAILURE,
          payload: { error: err },
        });
      }
    };

    fetchPublicBoard();
  }, [id, dispatch]);

  // Sort lists by position (only show active lists, not archive/trash)
  const sortedLists = useMemo(() => {
    if (!lists) return [];
    return [...lists]
      .filter((list) => list.type === 'active')
      .sort((a, b) => a.position - b.position);
  }, [lists]);

  // Group cards by list
  const cardsByListId = useMemo(() => {
    if (!cards) return {};
    return cards.reduce((acc, card) => {
      if (!acc[card.listId]) {
        acc[card.listId] = [];
      }
      acc[card.listId].push(card);
      return acc;
    }, {});
  }, [cards]);

  // Create labels map
  const labelsById = useMemo(() => {
    if (!labels) return {};
    return labels.reduce((acc, label) => {
      acc[label.id] = label;
      return acc;
    }, {});
  }, [labels]);

  // Create card labels map
  const labelIdsByCardId = useMemo(() => {
    if (!cardLabels) return {};
    return cardLabels.reduce((acc, cl) => {
      if (!acc[cl.cardId]) {
        acc[cl.cardId] = [];
      }
      acc[cl.cardId].push(cl.labelId);
      return acc;
    }, {});
  }, [cardLabels]);

  if (isFetching) {
    return (
      <div className={styles.loaderWrapper}>
        <Loader active size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.error}>
          <h1>{t('common.boardNotFound', { context: 'title' })}</h1>
          <p>{t('common.boardNotFoundOrNotPublic')}</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <PublicHeader boardName={board.name} projectName={project?.name} />
      <div className={styles.content}>
        <div className={styles.listsWrapper}>
          <div className={styles.lists}>
            {sortedLists.map((list) => (
              <PublicList
                key={list.id}
                list={list}
                cards={cardsByListId[list.id] || []}
                labelsById={labelsById}
                labelIdsByCardId={labelIdsByCardId}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.viewOnly}>{t('common.viewOnly')}</span>
        <span className={styles.poweredBy}>
          {t('common.poweredByPlanka')}
        </span>
      </div>
    </div>
  );
});

export default PublicBoard;

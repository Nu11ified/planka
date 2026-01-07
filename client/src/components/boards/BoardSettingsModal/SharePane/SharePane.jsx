/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Header, Icon, Input, Message, Radio, Segment, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';

import styles from './SharePane.module.scss';

const SharePane = React.memo(() => {
  const selectBoardById = useMemo(() => selectors.makeSelectBoardById(), []);

  const boardId = useSelector((state) => selectors.selectCurrentModal(state).params.id);
  const board = useSelector((state) => selectBoardById(state, boardId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const publicUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/public/boards/${boardId}`;
  }, [boardId]);

  const handleTogglePublic = useCallback(
    (_, { checked }) => {
      dispatch(
        entryActions.updateBoard(boardId, {
          isPublic: checked,
        }),
      );
    },
    [boardId, dispatch],
  );

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [publicUrl]);

  return (
    <Tab.Pane attached={false} className={styles.wrapper}>
      <Divider horizontal className={styles.firstDivider}>
        <Header as="h4">
          {t('common.publicAccess', {
            context: 'title',
          })}
        </Header>
      </Divider>
      <Segment basic className={styles.content}>
        <div className={styles.toggleWrapper}>
          <Radio
            toggle
            name="isPublic"
            checked={board.isPublic}
            label={t('common.makeBoardPublic')}
            className={styles.radio}
            onChange={handleTogglePublic}
          />
        </div>
        {board.isPublic ? (
          <Message info className={styles.message}>
            <Icon name="globe" />
            <span>{t('common.publicBoardEnabled')}</span>
          </Message>
        ) : (
          <Message className={styles.message}>
            <Icon name="lock" />
            <span>{t('common.publicBoardDisabled')}</span>
          </Message>
        )}
        {board.isPublic && (
          <>
            <Divider horizontal>
              <Header as="h4">
                {t('common.shareLink', {
                  context: 'title',
                })}
              </Header>
            </Divider>
            <div className={styles.linkWrapper}>
              <Input
                fluid
                readOnly
                value={publicUrl}
                className={styles.linkInput}
                action={
                  <Button
                    icon={isCopied ? 'check' : 'copy'}
                    color={isCopied ? 'green' : undefined}
                    onClick={handleCopyLink}
                    title={t('common.copyPublicLink')}
                  />
                }
              />
              {isCopied && (
                <span className={styles.copiedMessage}>
                  {t('common.publicLinkCopied')}
                </span>
              )}
            </div>
            <Message warning className={styles.warningMessage}>
              <Icon name="warning sign" />
              <span>{t('common.publicBoardWarning')}</span>
            </Message>
          </>
        )}
      </Segment>
    </Tab.Pane>
  );
});

export default SharePane;

/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const initialState = {
  board: null,
  project: null,
  users: [],
  boardMemberships: [],
  labels: [],
  lists: [],
  cards: [],
  cardMemberships: [],
  cardLabels: [],
  taskLists: [],
  tasks: [],
  attachments: [],
  customFieldGroups: [],
  customFields: [],
  customFieldValues: [],
  isFetching: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.PUBLIC_BOARD_FETCH:
      return {
        ...initialState,
        isFetching: true,
      };
    case ActionTypes.PUBLIC_BOARD_FETCH__SUCCESS:
      return {
        ...state,
        board: action.payload.board,
        project: action.payload.project,
        users: action.payload.users,
        boardMemberships: action.payload.boardMemberships,
        labels: action.payload.labels,
        lists: action.payload.lists,
        cards: action.payload.cards,
        cardMemberships: action.payload.cardMemberships,
        cardLabels: action.payload.cardLabels,
        taskLists: action.payload.taskLists,
        tasks: action.payload.tasks,
        attachments: action.payload.attachments,
        customFieldGroups: action.payload.customFieldGroups,
        customFields: action.payload.customFields,
        customFieldValues: action.payload.customFieldValues,
        isFetching: false,
        error: null,
      };
    case ActionTypes.PUBLIC_BOARD_FETCH__FAILURE:
      return {
        ...initialState,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

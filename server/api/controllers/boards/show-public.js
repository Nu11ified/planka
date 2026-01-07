/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /public/boards/{id}:
 *   get:
 *     summary: Get public board details
 *     description: Retrieves comprehensive board information for a public board without authentication.
 *     tags:
 *       - Public
 *     operationId: getPublicBoard
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the public board to retrieve
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Public board details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *                 - included
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Board'
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                     - projects
 *                     - boardMemberships
 *                     - labels
 *                     - lists
 *                     - cards
 *                     - cardMemberships
 *                     - cardLabels
 *                     - taskLists
 *                     - tasks
 *                     - attachments
 *                     - customFieldGroups
 *                     - customFields
 *                     - customFieldValues
 *                   properties:
 *                     users:
 *                       type: array
 *                       description: Related users
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     projects:
 *                       type: array
 *                       description: Parent project
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *                     boardMemberships:
 *                       type: array
 *                       description: Related board memberships
 *                       items:
 *                         $ref: '#/components/schemas/BoardMembership'
 *                     labels:
 *                       type: array
 *                       description: Related labels
 *                       items:
 *                         $ref: '#/components/schemas/Label'
 *                     lists:
 *                       type: array
 *                       description: Related lists
 *                       items:
 *                         $ref: '#/components/schemas/List'
 *                     cards:
 *                       type: array
 *                       description: Related cards
 *                       items:
 *                         $ref: '#/components/schemas/Card'
 *                     cardMemberships:
 *                       type: array
 *                       description: Related card-membership associations
 *                       items:
 *                         $ref: '#/components/schemas/CardMembership'
 *                     cardLabels:
 *                       type: array
 *                       description: Related card-label associations
 *                       items:
 *                         $ref: '#/components/schemas/CardLabel'
 *                     taskLists:
 *                       type: array
 *                       description: Related task lists
 *                       items:
 *                         $ref: '#/components/schemas/TaskList'
 *                     tasks:
 *                       type: array
 *                       description: Related tasks
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     attachments:
 *                       type: array
 *                       description: Related attachments
 *                       items:
 *                         $ref: '#/components/schemas/Attachment'
 *                     customFieldGroups:
 *                       type: array
 *                       description: Related custom field groups
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldGroup'
 *                     customFields:
 *                       type: array
 *                       description: Related custom fields
 *                       items:
 *                         $ref: '#/components/schemas/CustomField'
 *                     customFieldValues:
 *                       type: array
 *                       description: Related custom field values
 *                       items:
 *                         $ref: '#/components/schemas/CustomFieldValue'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    id: {
      ...idInput,
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { board, project } = await sails.helpers.boards
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    // Check if the board is public
    if (!board.isPublic) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const boardMemberships = await BoardMembership.qm.getByBoardId(board.id);
    const labels = await Label.qm.getByBoardId(board.id);
    const lists = await List.qm.getByBoardId(board.id);

    const finiteLists = lists.filter((list) => sails.helpers.lists.isFinite(list));
    const finiteListIds = sails.helpers.utils.mapRecords(finiteLists);

    const cards = await Card.qm.getByListIds(finiteListIds);
    const cardIds = sails.helpers.utils.mapRecords(cards);

    const userIds = _.union(
      sails.helpers.utils.mapRecords(boardMemberships, 'userId'),
      sails.helpers.utils.mapRecords(cards, 'creatorUserId', true, true),
    );

    const users = await User.qm.getByIds(userIds);
    const cardMemberships = await CardMembership.qm.getByCardIds(cardIds);
    const cardLabels = await CardLabel.qm.getByCardIds(cardIds);

    const taskLists = await TaskList.qm.getByCardIds(cardIds);
    const taskListIds = sails.helpers.utils.mapRecords(taskLists);

    const tasks = await Task.qm.getByTaskListIds(taskListIds);
    const attachments = await Attachment.qm.getByCardIds(cardIds);

    const boardCustomFieldGroups = await CustomFieldGroup.qm.getByBoardId(board.id);
    const cardCustomFieldGroups = await CustomFieldGroup.qm.getByCardIds(cardIds);

    const customFieldGroups = [...boardCustomFieldGroups, ...cardCustomFieldGroups];
    const customFieldGroupIds = sails.helpers.utils.mapRecords(customFieldGroups);

    const customFields = await CustomField.qm.getByCustomFieldGroupIds(customFieldGroupIds);
    const customFieldValues = await CustomFieldValue.qm.getByCardIds(cardIds);

    // For public access, cards are not subscribed
    cards.forEach((card) => {
      // eslint-disable-next-line no-param-reassign
      card.isSubscribed = false;
    });

    return {
      item: board,
      included: {
        boardMemberships,
        labels,
        lists,
        cards,
        cardMemberships,
        cardLabels,
        taskLists,
        tasks,
        customFieldGroups,
        customFields,
        customFieldValues,
        // Pass null for user to limit exposed data (e.g., hide emails)
        users: sails.helpers.users.presentMany(users, null),
        projects: [project],
        attachments: sails.helpers.attachments.presentMany(attachments),
      },
    };
  },
};

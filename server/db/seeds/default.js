/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const bcrypt = require('bcrypt');

const buildData = () => {
  // Use snake_case to match actual database column names
  const data = {
    role: 'admin',
    is_sso_user: false,
    is_deactivated: false,
  };

  if (process.env.DEFAULT_ADMIN_PASSWORD) {
    console.log('DEFAULT_ADMIN_PASSWORD is set, hashing password...');
    data.password = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD, 10);
  } else {
    console.log('WARNING: DEFAULT_ADMIN_PASSWORD is NOT set!');
  }
  if (process.env.DEFAULT_ADMIN_NAME) {
    data.name = process.env.DEFAULT_ADMIN_NAME;
    console.log(`Admin name: ${data.name}`);
  }
  if (process.env.DEFAULT_ADMIN_USERNAME) {
    data.username = process.env.DEFAULT_ADMIN_USERNAME.toLowerCase();
    console.log(`Admin username: ${data.username}`);
  }

  return data;
};

exports.seed = async (knex) => {
  const email = process.env.DEFAULT_ADMIN_EMAIL && process.env.DEFAULT_ADMIN_EMAIL.toLowerCase();

  if (email) {
    const data = buildData();

    // Check if user already exists
    const existingUser = await knex('user_account').where('email', email).first();

    if (existingUser) {
      // Always update existing user with current env vars
      console.log(`Updating existing admin user: ${email}`);
      await knex('user_account').update(data).where('email', email);
      console.log('Admin user updated successfully');
    } else {
      // Create new user
      console.log(`Creating new admin user: ${email}`);
      await knex('user_account').insert({
        ...data,
        email,
        subscribe_to_own_cards: false,
        subscribe_to_card_when_commenting: true,
        turn_off_recent_card_highlighting: false,
        enable_favorites_by_default: false,
        default_editor_mode: 'wysiwyg',
        default_home_view: 'groupedProjects',
        default_projects_order: 'byDefault',
        created_at: new Date().toISOString(),
      });
      console.log('Admin user created successfully');
    }
  } else {
    console.log('No DEFAULT_ADMIN_EMAIL set, skipping admin user creation');
  }

  const activeUsersLimit = parseInt(process.env.ACTIVE_USERS_LIMIT, 10);

  if (!Number.isNaN(activeUsersLimit)) {
    let orderByQuery;
    let orderByQueryValues;

    if (email) {
      orderByQuery = 'CASE WHEN email = ? THEN 0 WHEN role = ? THEN 1 ELSE 2 END';
      orderByQueryValues = [email, 'admin'];
    } else {
      orderByQuery = 'CASE WHEN role = ? THEN 0 ELSE 1 END';
      orderByQueryValues = 'admin';
    }

    const users = await knex('user_account')
      .select('id')
      .where('is_deactivated', false)
      .orderByRaw(orderByQuery, orderByQueryValues)
      .orderBy('id')
      .offset(activeUsersLimit);

    if (users.length > 0) {
      const userIds = users.map(({ id }) => id);

      await knex('user_account')
        .update({
          isDeactivated: true,
        })
        .whereIn('id', userIds);
    }
  }
};

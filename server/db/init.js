/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const initKnex = require('knex');

const knexfile = require('./knexfile');

const knex = initKnex(knexfile);

(async () => {
  try {
    console.log('Running migrations...');
    await knex.migrate.latest();
    console.log('Migrations complete.');

    console.log('Running seeds...');
    await knex.seed.run();
    console.log('Seeds complete.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
    throw error;
  } finally {
    knex.destroy();
  }
})();

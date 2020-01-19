/*
 * Copyright (c) 2018 Mattia Panzeri <mattia.panzeri93@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import program from 'commander';

import { EnvironmentManager, IconGenerator, SplashGenerator } from './commands';

program
  .description(process.env.PKG_DESCRIPTION)
  .version(process.env.PKG_VERSION);

program.command('icons').action(cmd => {
  new IconGenerator().generateIcons();
});

program.command('splash').action(cmd => {
  new SplashGenerator().generateSplashscreens();
});

program
  .command('dotenv <environmentName>')
  .description(
    'Manage .env files for react-native-dotenv for a specific environment (development, production, etc...)',
  )
  .action(environmentName => {
    EnvironmentManager.setupEnvironment({ envName: environmentName });
  });

program.parse(process.argv);

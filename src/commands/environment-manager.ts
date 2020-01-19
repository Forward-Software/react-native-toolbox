/*
 * Copyright (c) 2018 Mattia Panzeri <mattia.panzeri93@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import colors from 'colors';
import fs from 'fs';
import mkdirp from 'mkdirp-promise';
import path from 'path';

import { FileUtils } from '../utils/file-utils';

export default class EnvironmentManager {
  public static async setupEnvironment({ envName }): Promise<void> {
    const sourceEnvFilePath = `./.env.${envName}`;

    const sourceFilesExists = FileUtils.checkAssetFile(sourceEnvFilePath);
    if (!sourceFilesExists) {
      console.error('Source file', colors.cyan(sourceEnvFilePath), 'not found!', colors.red('ABORTING'));
      process.exit(1);
    }

    // Remove existing .env file
    try {
      fs.unlinkSync('./.env');
    } catch {
      // File not found!
    }

    console.log(`Generating env from '${sourceEnvFilePath}' file...`);

    // Copy sourceEnvFile to .env
    fs.copyFileSync(sourceEnvFilePath, './.env');

    console.log(`Generating env from '${sourceEnvFilePath}' file...`, colors.green('DONE'));
  }
}

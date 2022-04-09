/*
 * Copyright (c) 2020 Mattia Panzeri <mattia.panzeri93@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command, Flags} from '@oclif/core'
import {cyan, red} from 'chalk'
import * as Listr from 'listr'
import * as fsp from 'node:fs/promises'

import {checkAssetFile} from '../utils/file-utils'

export default class Dotenv extends Command {
  static description = `manage .env files for react-native-dotenv
Manage .env files for react-native-dotenv for a specific environment (development, production, etc...)
`

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'environmentName',
      description: 'name of the environment to load .dotenv file for',
      required: true,
      hidden: false,
    },
  ]

  async run(): Promise<void> {
    const {args} = await this.parse(Dotenv)

    const sourceEnvFilePath = `./.env.${args.environmentName}`
    const outputEnvFile = './.env'

    const sourceFilesExists = checkAssetFile(sourceEnvFilePath)
    if (!sourceFilesExists) {
      this.error(`Source file ${cyan(sourceEnvFilePath)} not found! ${red('ABORTING')}`)
    }

    this.log(`Generating .env from ${cyan(sourceEnvFilePath)} file...`)

    const workflow = new Listr([
      {
        title: 'Remove existing .env file',
        task: async () => {
          try {
            await fsp.unlink(outputEnvFile)
          } catch {}
        },
      },
      {
        title: 'Generate .env file',
        task: () => fsp.copyFile(sourceEnvFilePath, outputEnvFile),
      },
    ])

    try {
      await workflow.run()
    } catch (error) {
      this.error(error as Error)
    }
  }
}

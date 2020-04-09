/*
 * Copyright (c) 2020 Mattia Panzeri <mattia.panzeri93@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command, flags} from '@oclif/command'
import * as chalk from 'chalk'
import {readFileSync, promises as fsp} from 'fs'
import * as Listr from 'listr'
import {join} from 'path'
import * as sharp from 'sharp'

import {checkAssetFile, mkdirp} from '../utils/file-utils'

interface ContentJsonImage {
  filename: string;
  idiom: string;
  scale: string;
  size?: string;
}

interface ContentJsonInfo {
  author: string;
  version: number;
}

interface ContentJson {
  images: ContentJsonImage[];
  info: ContentJsonInfo;
}

const iOSSplashscreenSizes = [
  {
    height: 480,
    width: 320,
  },
  {
    density: '2x',
    height: 1334,
    width: 750,
  },
  {
    density: '3x',
    height: 2208,
    width: 1242,
  },
]

const AndroidSplashscreenSizes = [
  {
    density: 'ldpi',
    height: 320,
    width: 200,
  },
  {
    density: 'mdpi',
    height: 480,
    width: 320,
  },
  {
    density: 'hdpi',
    height: 800,
    width: 480,
  },
  {
    density: 'xhdpi',
    height: 1280,
    width: 720,
  },
  {
    density: 'xxhdpi',
    height: 1600,
    width: 960,
  },
  {
    density: 'xxxhdpi',
    height: 1920,
    width: 1280,
  },
]

export default class Splash extends Command {
  static description = `generate app splashscreen for react-native-splash-screen
Generate app splashscreen using FILE as base to be used with crazycodeboy/react-native-splash-screen module.
The base splashscreen file should be at least 1242x2208px.
`

  static flags = {
    help: flags.help({char: 'h'}),
    appName: flags.string({
      char: 'a',
      description: "the appName used to build output assets path. Default is retrieved from 'app.json' file.",
      default: () => {
        try {
          const {name} = JSON.parse(readFileSync('./app.json', 'utf8'))
          return name
        } catch {
          return null
        }
      },
    }),
  }

  static args = [
    {
      name: 'file',
      description: 'input splashscreen file',
      required: false,
      default: './assets/splashscreen.png',
      hidden: false,
    },
  ]

  async run() {
    const {args, flags} = this.parse(Splash)

    const sourceFilesExists = checkAssetFile(args.file)
    if (!sourceFilesExists) {
      this.error(`Source file ${chalk.cyan(args.file)} not found! ${chalk.red('ABORTING')}`)
    }

    if (!flags.appName) {
      this.error(`Failed to retrive ${chalk.cyan('appName')} value. Please specify it with the ${chalk.green('appName')} flag or check that ${chalk.cyan('app.json')} file exists. ${chalk.red('ABORTING')}`)
    }

    this.log(`Generating splashscreens for '${flags.appName}' app...`)

    const iOSOutputDirPath = `./ios/${flags.appName}/Images.xcassets/Splashscreen.imageset`
    const baseAndroidOutputDirPath = './android/app/src/main/res'

    const workflow = new Listr([
      {
        title: '🍎 iOS splashscreens',
        task: () => new Listr([
          {
            title: 'Create assets folder',
            task: () => mkdirp(iOSOutputDirPath),
          },
          {
            title: 'Generate splashscreen',
            task: () => {
              const iOSSplashscreenTasks = iOSSplashscreenSizes.map(({density, height, width}) => {
                const filename = this.getIOSAssetNameForDensity(density)
                const outputFile = join(iOSOutputDirPath, this.getIOSAssetNameForDensity(density))

                return {
                  title: `Generate ${filename}...`,
                  task: () => this.generateSplashscreen(args.file, outputFile,  width, height),
                }
              })

              return new Listr(iOSSplashscreenTasks)
            },
          },
          {
            title: 'Generate splashscreens manifest',
            task: () => {
              const images = iOSSplashscreenSizes.map(({density}) => ({
                filename: this.getIOSAssetNameForDensity(density),
                idiom: 'universal',
                scale: `${density || '1x'}`,
              }))

              // Create Contents.json structure
              const contentJson: ContentJson = {
                images,
                info: {
                  author: 'react-native-toolbox',
                  version: 1,
                },
              }

              return fsp.writeFile(join(iOSOutputDirPath, 'Contents.json'), JSON.stringify(contentJson, null, 2))
            },
          },
        ]),
      },
      {
        title: '🤖 Android splashscreens',
        task: () => new Listr([
          {
            title: 'Create assets folder',
            task: () => mkdirp(baseAndroidOutputDirPath),
          },
          {
            title: 'Generate splashscreens',
            task: () => {
              const androidSplashTasks = AndroidSplashscreenSizes.reduce((acc, {density, width, height}) => {
                const densityFolderPath = join(baseAndroidOutputDirPath, `drawable-${density}`)

                const densityFolderTask: Listr.ListrTask = {
                  title: `Create Android '${density}' assets folder`,
                  task: () => mkdirp(densityFolderPath),
                }
                acc.push(densityFolderTask)

                const outputFile = join(densityFolderPath, 'splashscreen.png')
                const densitySplashscreenTask: Listr.ListrTask = {
                  title: `Generate ${join(`drawable-${density}`, 'splashscreen.png')}...`,
                  task: () => this.generateSplashscreen(args.file, outputFile,  width, height),
                }
                acc.push(densitySplashscreenTask)

                return acc
              }, [] as Listr.ListrTask[])

              return new Listr(androidSplashTasks)
            },
          },
        ]),
      },
    ])

    try {
      await workflow.run()
    } catch (error) {
      this.error(error)
    }
  }

  private getIOSAssetNameForDensity(density?: string): string {
    return `splashscreen${density ? `@${density}` : ''}.png`
  }

  private async generateSplashscreen(inputFilePath: string, outputFilePath: string, width: number, height: number) {
    return sharp(inputFilePath)
    .resize(width, height, {fit: 'cover'})
    .toFile(outputFilePath)
  }
}

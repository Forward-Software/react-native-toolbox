/*
 * Copyright (c) 2020 Mattia Panzeri <mattia.panzeri93@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Command, Flags} from '@oclif/core'
import {cyan, green, red} from 'chalk'
import * as Listr from 'listr'
import {readFileSync, promises as fsp} from 'node:fs'
import {join} from 'node:path'
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

enum MaskType {
  roundedCorners,
  circle,
}

const iOSIconSizes = [
  {
    baseSize: 20,
    name: 'Icon-Notification',
    scales: [2, 3],
  },
  {
    baseSize: 29,
    name: 'Icon-Small',
    scales: [2, 3],
  },
  {
    baseSize: 40,
    name: 'Icon-Spotlight-40',
    scales: [2, 3],
  },
  {
    baseSize: 60,
    name: 'Icon-60',
    scales: [2, 3],
  },
  {
    baseSize: 1024,
    idiom: 'ios-marketing',
    name: 'iTunesArtwork',
    scales: [1],
  },
]

const AndroidIconSizes = [
  {
    density: 'mdpi',
    size: 48,
  },
  {
    density: 'hdpi',
    size: 72,
  },
  {
    density: 'xhdpi',
    size: 96,
  },
  {
    density: 'xxhdpi',
    size: 144,
  },
  {
    density: 'xxxhdpi',
    size: 192,
  },
]

export default class Icons extends Command {
  static description = `generate app icons
Generate app icons using FILE as base.
The base icon file should be at least 1024x1024px.
`

  static flags = {
    help: Flags.help({char: 'h'}),
    appName: Flags.string({
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
      description: 'input icon file',
      required: false,
      default: './assets/icon.png',
      hidden: false,
    },
  ]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Icons)

    const sourceFilesExists = checkAssetFile(args.file)
    if (!sourceFilesExists) {
      this.error(`Source file ${cyan(args.file)} not found! ${red('ABORTING')}`)
    }

    if (!flags.appName) {
      this.error(`Failed to retrive ${cyan('appName')} value. Please specify it with the ${green('appName')} flag or check that ${cyan('app.json')} file exists. ${red('ABORTING')}`)
    }

    this.log(`Generating icons for '${flags.appName}' app...`)

    const iOSOutputDirPath = `./ios/${flags.appName}/Images.xcassets/AppIcon.appiconset`
    const baseAndroidOutputDirPath = './android/app/src/main'

    const workflow = new Listr([
      {
        title: '🍎 iOS icons',
        task: () => new Listr([
          {
            title: 'Create assets folder',
            task: () => mkdirp(iOSOutputDirPath),
          },
          {
            title: 'Generate icons',
            task: () => {
              const iOSIconsTasks = iOSIconSizes.flatMap(sizeDef => {
                const {baseSize, name, scales} = sizeDef
                const iOSIconScaleTasks: Listr.ListrTask[] = scales.map(scale => {
                  const filename = this.getIOSIconName(name, scale)
                  const imageSize = baseSize * scale

                  return {
                    title: `Generate icon ${filename}...`,
                    task: () => sharp(args.file)
                    .resize(imageSize, imageSize, {fit: 'cover'})
                    .toFile(join(iOSOutputDirPath, filename)),
                  } as Listr.ListrTask
                })

                return iOSIconScaleTasks
              })

              return new Listr(iOSIconsTasks)
            },
          },
          {
            title: 'Generate icons manifest',
            task: () => {
              const contentJson: ContentJson = {
                images: [],
                info: {
                  author: 'react-native-toolbox',
                  version: 1,
                },
              }

              // Create Contents.json structure
              for (const {baseSize, idiom, name, scales} of iOSIconSizes) {
                for (const scale of scales) {
                  contentJson.images.push({
                    filename: this.getIOSIconName(name, scale),
                    idiom: idiom || 'iphone',
                    scale: `${scale}x`,
                    size: `${baseSize}x${baseSize}`,
                  })
                }
              }

              return fsp.writeFile(
                join(iOSOutputDirPath, 'Contents.json'),
                JSON.stringify(contentJson, null, 2),
              )
            },
          },
        ]),
      },
      {
        title: '🤖 Android icons',
        task: () => new Listr([
          {
            title: 'Create assets folder',
            task: () => mkdirp(baseAndroidOutputDirPath),
          },
          {
            title: 'Create web icon',
            task: () => {
              const outputFilePath = join(baseAndroidOutputDirPath, 'web_hi_res_512.png')
              return this.generateAndroidIconRounded(args.file, outputFilePath, 512)
            },
          },
          {
            title: 'Create launcher icons',
            task: () => {
              const androidIconTasks = AndroidIconSizes.flatMap(({density, size}) => {
                const androidIconDensityTasks: Listr.ListrTask[] = []

                const densityFolderPath = join(baseAndroidOutputDirPath, `res/mipmap-${density}`)
                const densityFolderTask: Listr.ListrTask = {
                  title: `Create Android '${density}' assets folder`,
                  task: () => mkdirp(densityFolderPath),
                }
                androidIconDensityTasks.push(densityFolderTask)

                const roundedFileName = 'ic_launcher.png'
                const roundedAndroidIconTask: Listr.ListrTask = {
                  title: `Generate icon ${roundedFileName}...`,
                  task: () => this.generateAndroidIconRounded(args.file, join(densityFolderPath, roundedFileName), size),
                }
                androidIconDensityTasks.push(roundedAndroidIconTask)

                const circleFileName = 'ic_launcher_round.png'
                const circleAndroidIconTask: Listr.ListrTask = {
                  title: `Generate icon ${circleFileName}...`,
                  task: () => this.generateAndroidIconCircle(args.file, join(densityFolderPath, circleFileName), size),
                }
                androidIconDensityTasks.push(circleAndroidIconTask)

                return androidIconDensityTasks
              })

              return new Listr(androidIconTasks)
            },
          },
        ]),
      },
    ])

    try {
      await workflow.run()
    } catch (error) {
      this.error(error as Error)
    }
  }

  private getIOSIconName(baseName: string, scale: number): string {
    return `${baseName}${scale > 1 ? `@${scale}x` : ''}.png`
  }

  private generateAndroidIconRounded(inputPath: string, outputPath: string, size: number) {
    const roundedCorners = this.getMask(MaskType.roundedCorners, size)
    return this.generateAndroidIcon(inputPath, outputPath, size, roundedCorners)
  }

  private generateAndroidIconCircle(inputPath: string, outputPath: string, size: number) {
    const circleIconMask = this.getMask(MaskType.circle, size)
    return this.generateAndroidIcon(inputPath, outputPath, size, circleIconMask)
  }

  private generateAndroidIcon(inputPath: string, outputPath: string, size: number, mask: Buffer) {
    return sharp(inputPath)
    .resize(size)
    .composite([
      {
        blend: 'dest-in',
        gravity: 'center',
        input: mask,
      },
    ])
    .toFile(outputPath)
  }

  private getMask(type: MaskType, size: number): Buffer {
    if (type === MaskType.roundedCorners) {
      const cornerRadius = Math.floor(size * 0.1) // Calculate 10% corner radius
      return Buffer.from(
        `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}"/></svg>`,
      )
    }

    const radius = Math.floor(size / 2)
    return Buffer.from(
      `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" /></svg>`,
    )
  }
}

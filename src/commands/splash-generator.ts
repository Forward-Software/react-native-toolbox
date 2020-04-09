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
import sharp from 'sharp';

import { FileUtils } from '../utils/file-utils';

interface SplashscreenSizeDefinition {
  density?: string;
  width: number;
  height: number;
}

export default class SplashGenerator {
  private static defaultSourceImageFilePath: string = './assets/splashscreen.png';

  private static defaultAndroidSizes: SplashscreenSizeDefinition[] = [
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
  ];

  private static defaultIOSSizes: SplashscreenSizeDefinition[] = [
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
  ];

  private appName: string;

  private sourceImageFilePath: string;

  private androidSizes: SplashscreenSizeDefinition[];

  private iOSSizes: SplashscreenSizeDefinition[];

  constructor() {
    const { name: appName } = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    this.appName = appName;

    this.androidSizes = SplashGenerator.defaultAndroidSizes;
    this.iOSSizes = SplashGenerator.defaultIOSSizes;

    this.sourceImageFilePath = SplashGenerator.defaultSourceImageFilePath;
  }

  public async generateSplashscreens(): Promise<void> {
    const sourceFilesExists = FileUtils.checkAssetFile(this.sourceImageFilePath);
    if (!sourceFilesExists) {
      console.error(
        `Source file ${colors.cyan(this.sourceImageFilePath)} not found! ${colors.red('ABORTING')}`,
      );
      process.exit(1);
    }

    console.log(`Generating splashscreen for '${this.appName}' app...`);

    await this.generateIOSAssets();

    await this.generateAndroidAssets();

    console.log(`Generating splashscreen for '${this.appName}' app... DONE.`);
  }

  /**
   * Android Splashscreen generation
   */
  private async generateAndroidAssets(): Promise<void> {
    console.info(`🤖  Android splashscreens:`);

    // Create base output path
    const outputDirPath = './android/app/src/main/res';
    mkdirp(outputDirPath);

    // Create required images
    for (const { density, width, height } of this.androidSizes) {
      console.info(`- Generate Android Splashscreen (${density})...`);
      // Create density specific folder, if it doesn't exists
      mkdirp(path.join(outputDirPath, `drawable-${density}`));

      // Resize image
      await sharp(this.sourceImageFilePath)
        .resize(width, height, { fit: 'cover' })
        .toFile(path.join(outputDirPath, `drawable-${density}`, `splashscreen.png`));
    }
  }

  /**
   * iOS Splashscreen generation
   */
  private async generateIOSAssets(): Promise<void> {
    console.info(`🍎  iOS assets:`);

    // Create output path
    const outputDirPath = `./ios/${this.appName}/Images.xcassets/Splashscreen.imageset`;
    mkdirp(outputDirPath);

    // Create Splashscreen images
    await this.generateIOSSplash(outputDirPath);

    // Create Manifest
    await this.generateIOSSplashManifest(outputDirPath);
  }

  private async generateIOSSplash(outputDirPath: string): Promise<void> {
    // Create required images
    for (const { density, height, width } of this.iOSSizes) {
      console.info(`- Generate iOS Splashscreen${density ? ` (${density})` : ''}...`);
      await sharp(this.sourceImageFilePath)
        .resize(width, height, { fit: 'cover' })
        .toFile(path.join(outputDirPath, this.getIOSAssetNameForDensity(density)));
    }
  }

  private async generateIOSSplashManifest(outputDirPath: string): Promise<void> {
    console.info(`- Generate iOS icons manifest...`);

    const contentJson: ContentJson = {
      images: [],
      info: {
        author: 'react-native-toolbox',
        version: 1,
      },
    };

    // Create Contents.json structure
    for (const { density } of this.iOSSizes) {
      contentJson.images.push({
        filename: this.getIOSAssetNameForDensity(density),
        idiom: 'universal',
        scale: `${density || '1x'}`,
      });
    }

    await fs.writeFileSync(path.join(outputDirPath, 'Contents.json'), JSON.stringify(contentJson, null, 2));
  }

  private getIOSAssetNameForDensity(density: string): string {
    return `splashscreen${density ? `@${density}` : ''}.png`;
  }
}

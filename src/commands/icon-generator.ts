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

interface SizeDefinitionAndroid {
  density: string;
  outputName?: string;
  size: number;
}

interface SizeDefinitionIOS {
  baseSize: number;
  idiom?: string;
  name: string;
  scales: number[];
}

interface SizeDefinitions {
  android: SizeDefinitionAndroid[];
  iOS: SizeDefinitionIOS[];
}

enum MaskType {
  roundedCorners,
  circle
}

export default class IconGenerator {
  private static defaultOutputSizes: SizeDefinitions = {
    android: [
      {
        density: 'mdpi',
        size: 48
      },
      {
        density: 'hdpi',
        size: 72
      },
      {
        density: 'xhdpi',
        size: 96
      },
      {
        density: 'xxhdpi',
        size: 144
      },
      {
        density: 'xxxhdpi',
        size: 192
      },
      {
        density: 'web',
        outputName: 'web_hi_res_512.png',
        size: 512
      }
    ],
    iOS: [
      {
        baseSize: 20,
        name: 'Icon-Notification',
        scales: [2, 3]
      },
      {
        baseSize: 29,
        name: 'Icon-Small',
        scales: [2, 3]
      },
      {
        baseSize: 40,
        name: 'Icon-Spotlight-40',
        scales: [2, 3]
      },
      {
        baseSize: 60,
        name: 'Icon-60',
        scales: [2, 3]
      },
      {
        baseSize: 1024,
        idiom: 'ios-marketing',
        name: 'iTunesArtwork',
        scales: [1]
      }
    ]
  };

  private static defaultSourceImageFilePath: string = './assets/icon.png';

  private appName: string;

  private androidSizes: SizeDefinitionAndroid[];

  private iOSSizes: SizeDefinitionIOS[];

  private sourceImageFilePath: string;

  constructor() {
    const { name: appName } = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    this.appName = appName;

    this.androidSizes = IconGenerator.defaultOutputSizes.android;
    this.iOSSizes = IconGenerator.defaultOutputSizes.iOS;

    this.sourceImageFilePath = IconGenerator.defaultSourceImageFilePath;
  }

  public async generateIcons(): Promise<void> {
    const sourceFilesExists = FileUtils.checkAssetFile(this.sourceImageFilePath);
    if (!sourceFilesExists) {
      console.error(`Source file ${colors.cyan(this.sourceImageFilePath)} not found! ${colors.red('ABORTING')}`);
      process.exit(1);
    }

    console.log(`Generating icons for '${this.appName}' app...`);

    await this.generateIOSAssets();

    await this.generateAndroidAssets();

    console.log(`Generating icons for '${this.appName}' app... DONE.`);
  }

  /**
   * iOS
   */
  private async generateIOSAssets(): Promise<void> {
    console.info(`🍎  iOS assets:`);

    const outputDirPath = `./ios/${this.appName}/Images.xcassets/AppIcon.appiconset`;

    // Icons
    await this.generateIOSIcons(outputDirPath);

    // Icon manifest
    await this.generateIOSIconsManifest(outputDirPath);
  }

  private async generateIOSIcons(outputDirPath: string): Promise<void> {
    // Create output path
    await mkdirp(outputDirPath);

    // Create required images
    for (const { baseSize, name, idiom, scales } of this.iOSSizes) {
      for (const scale of scales) {
        const filename = this.getIOSIconName(name, scale);
        const imageSize = baseSize * scale;
        console.info(`- Generate iOS icon ${filename}...`);
        await sharp(this.sourceImageFilePath)
          .resize(imageSize, imageSize, { fit: 'cover' })
          .toFile(path.join(outputDirPath, filename));
      }
    }
  }

  private async generateIOSIconsManifest(outputDirPath: string): Promise<void> {
    console.info(`- Generate iOS icons manifest...`);

    const contentJson: ContentJson = {
      images: [],
      info: {
        author: 'react-native-toolbox',
        version: 1
      }
    };

    // Create Contents.json structure
    for (const { baseSize, idiom, name, scales } of this.iOSSizes) {
      for (const scale of scales) {
        contentJson.images.push({
          filename: this.getIOSIconName(name, scale),
          idiom: idiom || 'iphone',
          scale: `${scale}x`,
          size: `${baseSize}x${baseSize}`
        });
      }
    }

    await fs.writeFileSync(path.join(outputDirPath, 'Contents.json'), JSON.stringify(contentJson, null, 2));
  }

  private getIOSIconName(baseName: string, scale: number): string {
    return `${baseName}${scale > 1 ? `@${scale}x` : ''}.png`;
  }

  /**
   * Android
   */
  private async generateAndroidAssets(): Promise<void> {
    console.info(`🤖  Android launcher icons:`);

    const baseAndroidOutputDirPath = `./android/app/src/main`;

    for (const size of this.androidSizes) {
      await this.generateAndroidIcon(size, baseAndroidOutputDirPath);
    }
  }

  private async generateAndroidIcon(outputSize: SizeDefinitionAndroid, baseOutputDirPath: string) {
    const { density, size, outputName } = outputSize;
    console.info(`- Generate Android launcher icon (${density})...`);

    // Create RoundedCorners mask
    const roundedCorners = this.getMask(MaskType.roundedCorners, size);

    // Create density-specific path
    const dDir = density !== 'web' ? path.join(baseOutputDirPath, `res/mipmap-${density}`) : baseOutputDirPath;
    await mkdirp(dDir);

    // resize & cut image - rounded corners
    await sharp(this.sourceImageFilePath)
      .resize(size)
      .composite([
        {
          input: roundedCorners,
          gravity: 'center',
          blend: 'dest-in',
        },
      ])
      .toFile(path.join(dDir, outputName || `ic_launcher.png`));

    // resize & cut image - rounded
    if (density !== 'web') {
      const circle = this.getMask(MaskType.circle, size);

      await sharp(this.sourceImageFilePath)
        .resize(size)
        .composite([
          {
            input: circle,
            gravity: 'center',
            blend: 'dest-in',
          },
        ])
        .toFile(path.join(dDir, outputName || `ic_launcher_round.png`));
    }
  }

  private getMask(type: MaskType, size: number): Buffer {
    if (type === MaskType.roundedCorners) {
      const cornerRadius = Math.floor(size * 0.1); // Calculate 10% corner radius
      return Buffer.from(
        `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}"/></svg>`
      );
    } else {
      const radius = Math.floor(size / 2);
      return Buffer.from(`<svg><circle cx="${radius}" cy="${radius}" r="${radius}" /></svg>`);
    }
  }
}

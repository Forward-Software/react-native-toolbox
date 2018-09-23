/*
* Copyright (c) 2018 Mattia Panzeri <mattia.panzeri93@gmail.com>
* 
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. 
*/

import fs from 'fs';

export class FileUtilis {
  public static checkAssetFile(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}

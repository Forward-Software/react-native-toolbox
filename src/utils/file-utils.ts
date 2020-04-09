/*
 * Copyright (c) 2020 Mattia Panzeri <mattia.panzeri93@gmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {existsSync, promises as fsp} from 'fs'

export function checkAssetFile(filePath: string): boolean {
  return existsSync(filePath)
}

export function mkdirp(path: string): Promise<void> {
  return fsp.mkdir(path, {recursive: true})
}

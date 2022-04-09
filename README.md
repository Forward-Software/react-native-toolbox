
React Native Toolbox
=====================

> A set of scripts to simplify React Native development

[![License](https://img.shields.io/npm/l/@panz3r/react-native-toolbox.svg)](https://github.com/panz3r/react-native-toolbox/blob/master/package.json) [![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

[![Version](https://img.shields.io/npm/v/@panz3r/react-native-toolbox.svg)](https://npmjs.org/package/@panz3r/react-native-toolbox) [![Downloads/week](https://img.shields.io/npm/dw/@panz3r/react-native-toolbox.svg)](https://npmjs.org/package/@panz3r/react-native-toolbox)

<!-- toc -->
* [Install](#install)
* [Commands](#commands)
<!-- tocstop -->

# Install

```bash
yarn add -D @panz3r/react-native-toolbox
```

or use it directly with

```bash
npx @panz3r/react-native-toolbox <command>
```

# Commands
<!-- commands -->
* [`rn-toolbox dotenv ENVIRONMENTNAME`](#rn-toolbox-dotenv-environmentname)
* [`rn-toolbox help [COMMAND]`](#rn-toolbox-help-command)
* [`rn-toolbox icons [FILE]`](#rn-toolbox-icons-file)
* [`rn-toolbox splash [FILE]`](#rn-toolbox-splash-file)

## `rn-toolbox dotenv ENVIRONMENTNAME`

manage .env files for react-native-dotenv

```
USAGE
  $ rn-toolbox dotenv [ENVIRONMENTNAME] [-h]

ARGUMENTS
  ENVIRONMENTNAME  name of the environment to load .dotenv file for

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  manage .env files for react-native-dotenv

  Manage .env files for react-native-dotenv for a specific environment (development, production, etc...)
```

_See code: [dist/commands/dotenv.ts](https://github.com/panz3r/react-native-toolbox/blob/v3.0.0/dist/commands/dotenv.ts)_

## `rn-toolbox help [COMMAND]`

Display help for rn-toolbox.

```
USAGE
  $ rn-toolbox help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for rn-toolbox.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `rn-toolbox icons [FILE]`

generate app icons

```
USAGE
  $ rn-toolbox icons [FILE] [-h] [-a <value>]

ARGUMENTS
  FILE  [default: ./assets/icon.png] input icon file

FLAGS
  -a, --appName=<value>  the appName used to build output assets path. Default is retrieved from 'app.json' file.
  -h, --help             Show CLI help.

DESCRIPTION
  generate app icons

  Generate app icons using FILE as base.

  The base icon file should be at least 1024x1024px.
```

_See code: [dist/commands/icons.ts](https://github.com/panz3r/react-native-toolbox/blob/v3.0.0/dist/commands/icons.ts)_

## `rn-toolbox splash [FILE]`

generate app splashscreen for react-native-splash-screen

```
USAGE
  $ rn-toolbox splash [FILE] [-h] [-a <value>]

ARGUMENTS
  FILE  [default: ./assets/splashscreen.png] input splashscreen file

FLAGS
  -a, --appName=<value>  the appName used to build output assets path. Default is retrieved from 'app.json' file.
  -h, --help             Show CLI help.

DESCRIPTION
  generate app splashscreen for react-native-splash-screen

  Generate app splashscreen using FILE as base to be used with crazycodeboy/react-native-splash-screen module.

  The base splashscreen file should be at least 1242x2208px.
```

_See code: [dist/commands/splash.ts](https://github.com/panz3r/react-native-toolbox/blob/v3.0.0/dist/commands/splash.ts)_
<!-- commandsstop -->

---

Made with :sparkles: & :heart: by [Mattia Panzeri](https://github.com/panz3r) and [contributors](https://github.com/panz3r/react-native-toolbox/graphs/contributors)

If you found this project to be helpful, please consider buying me a coffee.

[![buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/4f18nT0Nk)

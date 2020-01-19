# React Native Toolbox

> A set of scripts to simplify React Native development

## Install

```bash
yarn add -D @panz3r/react-native-toolbox
```

or use it directly with

```bash
npx @panz3r/react-native-toolbox <command>
```

## Generate App icons

To generate app icons:

- create a folder named `assets` at the root of your React Native project
- place an `icon.png` file (at least **1024x1024px**) inside the `assets` folder
- run

```bash
rn-toolbox icons
```

## Generate App splashscreen

To generate app splashscreen images (to be used by [`react-native-splash-screen`](https://github.com/crazycodeboy/react-native-splash-screen)):

- create a folder named `assets` at the root of your React Native project
- place an `splashscreen.png` file (at least **1242x2208px**) inside the `assets` folder
- run

```bash
rn-toolbox splash
```

## Setup Environment

To setup a `.env` file (to be used by [`react-native-dotenv`](https://github.com/zetachang/react-native-dotenv)):

- create `.env.dev` and `.env.prod` files (other files are supported too, be creative ;))
- run
```bash
rn-toolbox dotenv <env name> # such as 'dev' or 'prod'
```

*N.B:* running `react-native start` command after might require `--reset-cache` to read new env variables.

> This script has been inspired by this article [`Multi environment variable setup for React Native application`](https://medium.com/commutatus/multi-environment-variable-setup-for-react-native-application-70fde4de657f)

---

Made with :sparkles: & :heart: by [Mattia Panzeri](https://github.com/panz3r) and [contributors](https://github.com/panz3r/react-native-toolbox/graphs/contributors)

If you found this project to be helpful, please consider buying me a coffee.

[![buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoff.ee/4f18nT0Nk)

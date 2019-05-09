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

---

Made with :sparkles: & :heart: by [Mattia Panzeri](https://github.com/panz3r) and [contributors](https://github.com/panz3r/react-native-toolbox/graphs/contributors)

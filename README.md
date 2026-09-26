# DailyList

## 04. Set up linting and formatting

- **Article:** [Set up linting and formatting](https://aitechforyou.com/articles/react-native-linting-formatting).
- **Snapshot:** This branch contains the app after this article.
- **Progression:** Each article starts from the previous branch.
- **Name:** DailyList replaces the Taskly name used in the article.

## Changes in this article

- **ESLint:** Check the code with yarn lint.
- **Prettier:** Report formatting issues through ESLint.
- **Automatic fixes:** Run yarn lint --fix.
- **SDK compatibility:** Expo SDK 57 uses eslint.config.js instead of the older .eslintrc.js shown in the article.

## Run this snapshot

- **Branch:** Switch to this article’s snapshot.

```sh
git switch 04-react-native-linting-formatting
```

- **Dependencies:** Install the versions recorded in this branch.

```sh
yarn install --frozen-lockfile
```

- **App:** Start Expo and open the app in Expo Go.

```sh
yarn start
```

- **Lint:** Check the code and formatting.

```sh
yarn lint
```

## Article branches

| Order | Article | Branch |
| --- | --- | --- |
| 01–03 | [React Native project setup and dependency architecture](https://aitechforyou.com/articles/react-native-project-setup) · [Run a React Native app with Expo Go](https://aitechforyou.com/articles/react-native-expo-go) · [Why React Native apps use a framework](https://aitechforyou.com/articles/react-native-frameworks-overview) | `01-02-03` |
| 04 | [Set up linting and formatting](https://aitechforyou.com/articles/react-native-linting-formatting) | `04-react-native-linting-formatting` |
| 05 | [View, Text, and built-in styles](https://aitechforyou.com/articles/react-native-view-text-styling) | `05-react-native-view-text-styling` |
| 06 | [Pressable, TouchableOpacity, and Alert](https://aitechforyou.com/articles/react-native-pressable-touchable-alert) | `06-react-native-pressable-touchable-alert` |
| 07 | [Reusable components, typed props, and StyleSheet utilities](https://aitechforyou.com/articles/react-native-reusable-components-props) | `07-react-native-reusable-components-props` |
| 08 | [Conditional styling for a component](https://aitechforyou.com/articles/react-native-conditional-styling) | `08-react-native-conditional-styling` |
| 09 | [Icons in React Native](https://aitechforyou.com/articles/react-native-icons) | `09-react-native-icons` |
| 10 | [Navigation with Expo Router](https://aitechforyou.com/articles/react-native-expo-router) | `10-react-native-expo-router` |
| 11 | [Stack navigation, links, and router methods](https://aitechforyou.com/articles/react-native-screen-navigation) | `11-react-native-screen-navigation` |

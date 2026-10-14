# rnrc-codemod

Codemods for upgrading [react-native-reanimated-carousel](https://github.com/dohooo/react-native-reanimated-carousel) between major versions. Run them from your project root.

## v4 → v5

```bash
npx --yes rnrc-codemod v5 --dry .
npx --yes rnrc-codemod v5 .
```

`--dry` lists the files it would change without writing them. The codemod only makes the mechanical changes; follow the [v5 migration guide](https://rn-carousel.dev/migration-v5) for the rest.

# [2.6.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.5.1...v2.6.0) (2022-06-04)


### Bug Fixes

* global.__reanimatedWorkletInit is not a function ([591f0d8](https://github.com/dohooo/react-native-reanimated-carousel/commit/591f0d89744d4f7b97784139c86fa1ef85a70606)), closes [#159](https://github.com/dohooo/react-native-reanimated-carousel/issues/159) [#182](https://github.com/dohooo/react-native-reanimated-carousel/issues/182)

## [2.5.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.5.0...v2.5.1) (2022-06-01)

# [2.5.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.4.0...v2.5.0) (2022-05-29)


### Bug Fixes

* modify styles prop types ([c32a98c](https://github.com/dohooo/react-native-reanimated-carousel/commit/c32a98cb5667b3b97601186726869e73efcb924e)), closes [#195](https://github.com/dohooo/react-native-reanimated-carousel/issues/195)


### Features

* add index argument, can jump to specific position. And remove goToIndex prop in ref ([138e606](https://github.com/dohooo/react-native-reanimated-carousel/commit/138e606dccf8c94c2de800076695f38654ab911e)), closes [#196](https://github.com/dohooo/react-native-reanimated-carousel/issues/196)
* always return the real index ([03216a5](https://github.com/dohooo/react-native-reanimated-carousel/commit/03216a5761bd04a9220233f1bfbdd6dcb6549b7f)), closes [#192](https://github.com/dohooo/react-native-reanimated-carousel/issues/192)

# [2.4.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.11...v2.4.0) (2022-05-18)


### Bug Fixes

* index bug ([57a18ad](https://github.com/dohooo/react-native-reanimated-carousel/commit/57a18ad8f3382b737030b29a5bbc449fbcf08cb7)), closes [#185](https://github.com/dohooo/react-native-reanimated-carousel/issues/185)

## [2.3.11](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.10...v2.3.11) (2022-05-15)


### Bug Fixes

* focused index is not persisted when carousel component is re-rendered ([d82d39b](https://github.com/dohooo/react-native-reanimated-carousel/commit/d82d39bfa1abd9060bad6756b0feccd894d22cbe)), closes [#181](https://github.com/dohooo/react-native-reanimated-carousel/issues/181)

## [2.3.10](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.9...v2.3.10) (2022-05-04)


### Bug Fixes

* getCurrentIndex always return last snap index even after multiple data changes ([9b03a4d](https://github.com/dohooo/react-native-reanimated-carousel/commit/9b03a4d7f53bf22c0ee78dc91ec74f42b865357b)), closes [#178](https://github.com/dohooo/react-native-reanimated-carousel/issues/178)


### Features

* add testID props for e2e test ([a66eecb](https://github.com/dohooo/react-native-reanimated-carousel/commit/a66eecbe1603edb577ced79c63941d4d25c60ecc)), closes [#177](https://github.com/dohooo/react-native-reanimated-carousel/issues/177)

## [2.3.9](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.8...v2.3.9) (2022-05-03)


### Bug Fixes

* update typescript config ([8fa86a2](https://github.com/dohooo/react-native-reanimated-carousel/commit/8fa86a269afccdde77a9a2abe7ea75d658f22c9c))

## [2.3.8](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.7...v2.3.8) (2022-05-02)


### Bug Fixes

* fixed styles bug ([918bf45](https://github.com/dohooo/react-native-reanimated-carousel/commit/918bf45f1315d75017e96b32ab48830e13965224))

## [2.3.7](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.6...v2.3.7) (2022-05-02)


### Bug Fixes

* fix styles prop bug ([439ac4d](https://github.com/dohooo/react-native-reanimated-carousel/commit/439ac4d622f720cba287aa264573517218a365d6))

## [2.3.6](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.5...v2.3.6) (2022-05-02)


### Bug Fixes

* current index doesn't reset when modify data length ([99f44bc](https://github.com/dohooo/react-native-reanimated-carousel/commit/99f44bc995cf45970b151528aa9478cc03e1ceef)), closes [#163](https://github.com/dohooo/react-native-reanimated-carousel/issues/163)
* duplicate style ([7e7e00f](https://github.com/dohooo/react-native-reanimated-carousel/commit/7e7e00f4ee18bf92749f9e2224d4e0c7e98647ba)), closes [#169](https://github.com/dohooo/react-native-reanimated-carousel/issues/169)
* refactoring logic of withAutoFillData, Add onProgressChange value boundary ([101456a](https://github.com/dohooo/react-native-reanimated-carousel/commit/101456a4e7a3f4719db844b302bd6d5f912206cb)), closes [#158](https://github.com/dohooo/react-native-reanimated-carousel/issues/158)


### Features

* add autoFillData props, It controls whether the data is automatically populated ([309688c](https://github.com/dohooo/react-native-reanimated-carousel/commit/309688cb6c862f059e3915df9dce1c3f62e8e146)), closes [#170](https://github.com/dohooo/react-native-reanimated-carousel/issues/170)

## [2.3.5](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.4...v2.3.5) (2022-04-27)

## [2.3.4](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.3...v2.3.4) (2022-04-10)


### Bug Fixes

* "defaultIndex" wasn't define internal values (UI bridge and refs) ([7f7a659](https://github.com/dohooo/react-native-reanimated-carousel/commit/7f7a659a6e9863ecbdc7241d990c0e67c16313d0))

## [2.3.3](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.3-beta.1...v2.3.3) (2022-04-03)

## [2.3.3-beta.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.3-beta.0...v2.3.3-beta.1) (2022-03-30)


### Bug Fixes

* add *length and remove *data from deps ([fbfd372](https://github.com/dohooo/react-native-reanimated-carousel/commit/fbfd37293cd5931f8843ee3346debfffdf3c404d))
* https://github.com/dohooo/react-native-reanimated-carousel/issues/66 ([54e74d2](https://github.com/dohooo/react-native-reanimated-carousel/commit/54e74d20d7f6e6f73e8ba45f223578bc9b8bd9b3))
* update example dependence ([ac2c504](https://github.com/dohooo/react-native-reanimated-carousel/commit/ac2c504b09ee109bad8a8602b844800341e2881b))


### Features

* add flow animation ([d5d39a8](https://github.com/dohooo/react-native-reanimated-carousel/commit/d5d39a80cecbd9c5436b1c1c5f4faf8082ba976a))

## [2.3.3-beta.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.2...v2.3.3-beta.0) (2022-03-30)

## [2.3.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.2-beta.1...v2.3.2) (2022-03-03)

## [2.3.2-beta.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.2-beta.0...v2.3.2-beta.1) (2022-03-03)


### Bug Fixes

* remove logic that touch the screent will stopped animation ([4328d9a](https://github.com/dohooo/react-native-reanimated-carousel/commit/4328d9a1068a28817d12f4fb2ba066e419fad9c8))

## [2.3.2-beta.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.1...v2.3.2-beta.0) (2022-03-03)

## [2.3.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.3.0...v2.3.1) (2022-02-28)


### Bug Fixes

* fix memory leak ([73a5fe2](https://github.com/dohooo/react-native-reanimated-carousel/commit/73a5fe20a247ed1de84d23b64d7ba981410950ca)), closes [#137](https://github.com/dohooo/react-native-reanimated-carousel/issues/137)


### Features

* added "parallaxAdjacentItemScale" property into parallax layout ([7e98433](https://github.com/dohooo/react-native-reanimated-carousel/commit/7e98433eb6e91fadf22f27426ba2c004a35db7aa))

# [2.3.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.5-beta.3...v2.3.0) (2022-02-19)


### Features

* add enabled props ([e713e12](https://github.com/dohooo/react-native-reanimated-carousel/commit/e713e125bf44a45a9e48ae75dbc00f665368711f))
* deprecated enableSnap instead with snapEnabled ([43c84c2](https://github.com/dohooo/react-native-reanimated-carousel/commit/43c84c2cc8ac45247c3ea348d912673ff1ef5132))

## [2.2.5-beta.3](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.5-beta.2...v2.2.5-beta.3) (2022-02-04)

## [2.2.5-beta.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.5-beta.1...v2.2.5-beta.2) (2022-02-04)

## [2.2.5-beta.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.5-beta.0...v2.2.5-beta.1) (2022-02-04)

## [2.2.5-beta.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.4...v2.2.5-beta.0) (2022-02-01)


### Bug Fixes

* fixed type of props ([bb1e99b](https://github.com/dohooo/react-native-reanimated-carousel/commit/bb1e99bd2983d0d4a79a4ce3a9911f3edcb3391a))


### Features

* support to modify scroll animation. Add `withAnimation` props ([e3f34a4](https://github.com/dohooo/react-native-reanimated-carousel/commit/e3f34a4be91c69cd1239c69c1bed1f306042bd7a)), closes [#105](https://github.com/dohooo/react-native-reanimated-carousel/issues/105)

## [2.2.4](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.3...v2.2.4) (2022-01-25)


### Bug Fixes

* fixed types error ([d7af323](https://github.com/dohooo/react-native-reanimated-carousel/commit/d7af323052bb30c70b24de1ac24a8de78f80cdf1)), closes [#118](https://github.com/dohooo/react-native-reanimated-carousel/issues/118)

## [2.2.3](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.2...v2.2.3) (2022-01-24)


### Bug Fixes

* autoplay will paused when click ([eb21293](https://github.com/dohooo/react-native-reanimated-carousel/commit/eb21293d6c0544da9e62a418505945dc46a59cb6)), closes [#115](https://github.com/dohooo/react-native-reanimated-carousel/issues/115)

## [2.2.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.2.1...v2.2.2) (2022-01-23)


### Bug Fixes

* onProgressChange & onSnapToItem bug when only 2 image ([bdb2d74](https://github.com/dohooo/react-native-reanimated-carousel/commit/bdb2d74245dfdefe024ba11b462dbe29bd7e18d6)), closes [#74](https://github.com/dohooo/react-native-reanimated-carousel/issues/74)
* when autoPlay is false, manual sliding will still autoPlay ([6aa3cc4](https://github.com/dohooo/react-native-reanimated-carousel/commit/6aa3cc4a557efaa9e3262202f4a98ff960255b54)), closes [#111](https://github.com/dohooo/react-native-reanimated-carousel/issues/111)

## [2.2.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.1.2...v2.2.1) (2022-01-16)


### Bug Fixes

* fix comments ([753051f](https://github.com/dohooo/react-native-reanimated-carousel/commit/753051fddea78d0edc7ddffc657bc65a4c272dde))
* fix useCarouselController ([f5dc6dc](https://github.com/dohooo/react-native-reanimated-carousel/commit/f5dc6dc8976b2dddf387a7cd564d51756f04893b)), closes [#101](https://github.com/dohooo/react-native-reanimated-carousel/issues/101)

# [2.2.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.1.2...v2.2.0) (2022-01-16)


### Bug Fixes

* fix useCarouselController ([f5dc6dc](https://github.com/dohooo/react-native-reanimated-carousel/commit/f5dc6dc8976b2dddf387a7cd564d51756f04893b)), closes [#101](https://github.com/dohooo/react-native-reanimated-carousel/issues/101)

## [2.1.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.1.1...v2.1.2) (2022-01-11)


### Bug Fixes

* fix wrong offset when out of bounds ([db27279](https://github.com/dohooo/react-native-reanimated-carousel/commit/db2727951916876205a315c4b2fdcee63e74fab0)), closes [#94](https://github.com/dohooo/react-native-reanimated-carousel/issues/94)
* remove ExtrapolateParameter of normal layout translate ([850e960](https://github.com/dohooo/react-native-reanimated-carousel/commit/850e96082ec44422d99c5a5a1767a6530b1405d9)), closes [#96](https://github.com/dohooo/react-native-reanimated-carousel/issues/96)

## [2.1.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.1.0...v2.1.1) (2022-01-11)


### Bug Fixes

* autoplay will scroll out of bounds ([2cfacff](https://github.com/dohooo/react-native-reanimated-carousel/commit/2cfacffb62f1e4934393cb5f42e55cbdddc2d8f2))

# [2.1.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.0.0...v2.1.0) (2022-01-08)


### Features

* pass animation value to renderItem ([bf57233](https://github.com/dohooo/react-native-reanimated-carousel/commit/bf572335a19179aefd52d0bf43e61029ec2f945a)), closes [#89](https://github.com/dohooo/react-native-reanimated-carousel/issues/89)
* support to custom carousel animations by `customAnimation` `customConfig` props ([eb3082b](https://github.com/dohooo/react-native-reanimated-carousel/commit/eb3082b74d3f08f6205cce47a30435ffc8570145))


### BREAKING CHANGES

* Remove the parameter of `renderItem` and change it to `info` object



## [1.1.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v2.0.0...v2.1.0) (2022-01-04)


### Bug Fixes

* fix bug with windowSize props ([8a048df](https://github.com/dohooo/react-native-reanimated-carousel/commit/8a048dfafbf46ba6d4776f82564dea43af026144)), closes [#71](https://github.com/dohooo/react-native-reanimated-carousel/issues/71)

# [2.0.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.2.0-beta.4...v2.0.0) (2022-01-07)


### Bug Fixes

* fix bug from refactoring ([c77f4d8](https://github.com/dohooo/react-native-reanimated-carousel/commit/c77f4d8604e319528f2d15fd288734749615e077))

# [1.2.0-beta.4](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.2.0-beta.3...v1.2.0-beta.4) (2022-01-05)


### Bug Fixes

* solve a bug caused by Parallax/Normal layout reconstruction ([651bf5e](https://github.com/dohooo/react-native-reanimated-carousel/commit/651bf5ee0572f512dddc01205dbb74d651cfa0ce))

# [1.2.0-beta.3](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2022-01-05)


### Bug Fixes

* fix bug with windowSize props ([b9637ca](https://github.com/dohooo/react-native-reanimated-carousel/commit/b9637ca4f988851c6f0636e50c8079837eda42f6)), closes [#71](https://github.com/dohooo/react-native-reanimated-carousel/issues/71)
* onProgressChange/onSnapToItem props wrong calculation ([85de2f4](https://github.com/dohooo/react-native-reanimated-carousel/commit/85de2f41935e299ff7510e5b678e0f37fc29d13e)), closes [#74](https://github.com/dohooo/react-native-reanimated-carousel/issues/74)


### Features

* support to RTL ([c2c3bcf](https://github.com/dohooo/react-native-reanimated-carousel/commit/c2c3bcfd2fe475b9934962d62e97bc39bf8fdf2d)), closes [#69](https://github.com/dohooo/react-native-reanimated-carousel/issues/69)



# [1.1.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2022-01-03)


### Bug Fixes

* _ ([c8054f1](https://github.com/dohooo/react-native-reanimated-carousel/commit/c8054f17202e7ff33447cd70e83582f4914941ad))
* fix item blink when scroll active ([96c9b75](https://github.com/dohooo/react-native-reanimated-carousel/commit/96c9b751a7ee4cc0ba013801d098b05705c26bcf))
* fix with zindex ([f3b28cc](https://github.com/dohooo/react-native-reanimated-carousel/commit/f3b28cc8a83649a885307b82908e714bb2724ab4))
* item blink ([063f564](https://github.com/dohooo/react-native-reanimated-carousel/commit/063f5644779f37754608972507b10d0cfb87769a))
* item zIndex ([10e58a8](https://github.com/dohooo/react-native-reanimated-carousel/commit/10e58a876e8cb386a45d17ea8eb8bee79de0e94a))
* refactor stack layout ([dc975fe](https://github.com/dohooo/react-native-reanimated-carousel/commit/dc975fe8f25b03b59047fd21f596d626f806de2b))


### Features

* add stack layout ([5a70a23](https://github.com/dohooo/react-native-reanimated-carousel/commit/5a70a230307e0b258e16230d6b21be2c4d8c7497))
* multiple stack styles are supported ([d4497a7](https://github.com/dohooo/react-native-reanimated-carousel/commit/d4497a785f6da4dae79e812dac1d5515303d0cd3))
* support pagingEnabled snapEnabled ([000658e](https://github.com/dohooo/react-native-reanimated-carousel/commit/000658ed4a97b58d4e2649b6ab816e62919beff9)), closes [#65](https://github.com/dohooo/react-native-reanimated-carousel/issues/65)



## [1.0.12](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-12-28)


### Bug Fixes

* scroll pass the last item ([34a5e57](https://github.com/dohooo/react-native-reanimated-carousel/commit/34a5e5796a35f62374761bf2144a86f69acc8e66)), closes [#63](https://github.com/dohooo/react-native-reanimated-carousel/issues/63)



## [1.0.11](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-12-20)


### Bug Fixes

* fixed useAnimatedReaction wrong import ([7b7a3fc](https://github.com/dohooo/react-native-reanimated-carousel/commit/7b7a3fc4f49b5f3bfff664b2c07306334ac2e509))



## [1.0.10](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-12-19)


### Bug Fixes

* fix ScrollViewGesture callback ([40412fc](https://github.com/dohooo/react-native-reanimated-carousel/commit/40412fcab6c1e6e013ccd8c409c2fb9bffcde926))
* fixed failure to set default values ([5d02779](https://github.com/dohooo/react-native-reanimated-carousel/commit/5d0277925a0daf00944e7900d86f3ee463f77719))
* fixed types ([9f3068b](https://github.com/dohooo/react-native-reanimated-carousel/commit/9f3068bbb9dadbdd046ad50cf4437b53f335e4a9))
* modify useCarouselController params ([c8f2c6a](https://github.com/dohooo/react-native-reanimated-carousel/commit/c8f2c6acb9b578fa38d365c669aaf2beb6694686))


### Features

* add babel-loader in example,support to web ([1edc9c3](https://github.com/dohooo/react-native-reanimated-carousel/commit/1edc9c34a7a02e35fa6c18927d8b543367bb1c30))
* add examples ([666ba86](https://github.com/dohooo/react-native-reanimated-carousel/commit/666ba86729105bb825f95a9dbdc4290efbd3dffa))
* add navigation in example ([1687f1d](https://github.com/dohooo/react-native-reanimated-carousel/commit/1687f1db4c98e583f29326dc1b2a273adb19af4e))
* add ScrollViewGesture ([a903f12](https://github.com/dohooo/react-native-reanimated-carousel/commit/a903f12d73a18c2774318154544dda17c755f6ff))
* lazy loading ([ed75232](https://github.com/dohooo/react-native-reanimated-carousel/commit/ed75232eb25a475f994f327e94f9dd717b9cf251))
* springConfig props has be deprecated ([763c073](https://github.com/dohooo/react-native-reanimated-carousel/commit/763c07398f196391ebf478ebd9c45acd7c6890a3))
* vertical mode ([7645b75](https://github.com/dohooo/react-native-reanimated-carousel/commit/7645b753f9379cb86bba27764a99cd163a744570)), closes [#41](https://github.com/dohooo/react-native-reanimated-carousel/issues/41)


### Performance Improvements

* add example ([1684038](https://github.com/dohooo/react-native-reanimated-carousel/commit/16840383712eda31b1a8481fa5498ed9b92504cd))
* add example ([8527ffb](https://github.com/dohooo/react-native-reanimated-carousel/commit/8527ffbd2b374f880a42d445a24c385c18885859))
* lazy loading ([39ba773](https://github.com/dohooo/react-native-reanimated-carousel/commit/39ba7735946326c10dd5ec8b6ffe6a8fcf9a8006))



## [1.0.9](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-12-07)


### Performance Improvements

* add props 'windowSize' ([4e066ee](https://github.com/dohooo/react-native-reanimated-carousel/commit/4e066eed5a3d3eb9cc4a9d1173831a44385bac65)), closes [#46](https://github.com/dohooo/react-native-reanimated-carousel/issues/46)
* reduce the calculation of animation values ([de32274](https://github.com/dohooo/react-native-reanimated-carousel/commit/de322745d900251614e25005fe39dd32fab4e9a7)), closes [#46](https://github.com/dohooo/react-native-reanimated-carousel/issues/46)



## [1.0.8](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-12-06)


### Bug Fixes

* fix items position ([6d36555](https://github.com/dohooo/react-native-reanimated-carousel/commit/6d365550b677513c3b56ed3a401dbf021a0d2856)), closes [#51](https://github.com/dohooo/react-native-reanimated-carousel/issues/51)



## [1.0.7](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-12-05)


### Bug Fixes

* a quick call to the page number switch method causes an offset error ([0c93b86](https://github.com/dohooo/react-native-reanimated-carousel/commit/0c93b867f4e17583b08683404a36590fc267c03c)), closes [#30](https://github.com/dohooo/react-native-reanimated-carousel/issues/30)
* defaultIndex does not work as expected ([42e4616](https://github.com/dohooo/react-native-reanimated-carousel/commit/42e46166144ceac6b15c6ad4e7d18923a722f91b)), closes [#33](https://github.com/dohooo/react-native-reanimated-carousel/issues/33)
* fix computed error with MAX/MIN ([e9a3007](https://github.com/dohooo/react-native-reanimated-carousel/commit/e9a30070dbae04a889015be05aff398079f35e84))
* image flickers within Carousel when state is updated ([094f3af](https://github.com/dohooo/react-native-reanimated-carousel/commit/094f3af65b517f59d2982d3dcfc64dab1404fcc5)), closes [#32](https://github.com/dohooo/react-native-reanimated-carousel/issues/32)
* modify useOffsetX viewCount default value ([dd30b9c](https://github.com/dohooo/react-native-reanimated-carousel/commit/dd30b9c0ec52917eeb1d0a144e46318a1bae7da8))
* sliding error with no loop ([955b5ed](https://github.com/dohooo/react-native-reanimated-carousel/commit/955b5ede0d975231feab55258823a9538752c0e2)), closes [#24](https://github.com/dohooo/react-native-reanimated-carousel/issues/24)



## [1.0.4](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-11-18)


### Bug Fixes

* **hooks/usepropserrorboundary.ts:** always be error when data props set null ([2450fe1](https://github.com/dohooo/react-native-reanimated-carousel/commit/2450fe120b22ec561a3bc7c4b687ccfee0bfc080)), closes [#34](https://github.com/dohooo/react-native-reanimated-carousel/issues/34)



## [1.0.3](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-11-10)


### Features

* add defaultIndex props ([e9191f9](https://github.com/dohooo/react-native-reanimated-carousel/commit/e9191f96dab5885ca14bc873b5feeb6fa80ac82a)), closes [#31](https://github.com/dohooo/react-native-reanimated-carousel/issues/31)



## [1.0.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-11-03)


### Features

* add onProgressChange props ([a3894ff](https://github.com/dohooo/react-native-reanimated-carousel/commit/a3894ffb64d2541e61683d06c53487dc54af1a47))



## [1.0.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-11-01)


### Bug Fixes

* fix bug with reanimated ([6744f74](https://github.com/dohooo/react-native-reanimated-carousel/commit/6744f747424d6ad51e61bca0702eec8e60d00441))



# [1.0.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-10-31)


### Bug Fixes

* fix default timeConfig ([0f99500](https://github.com/dohooo/react-native-reanimated-carousel/commit/0f9950005604fa19ff73449a58b3944bd4f1fee2))
* solve sliding flicker problem ([96678e0](https://github.com/dohooo/react-native-reanimated-carousel/commit/96678e0d3c03ea6f6bc9a40534c1bb732475e102))
* solve sliding flicker problem ([e26c384](https://github.com/dohooo/react-native-reanimated-carousel/commit/e26c384f25b203a420f7bed2c356586cb1466f65))
* upgrade expo sdk 40 to 41. fix example error ([11b39b1](https://github.com/dohooo/react-native-reanimated-carousel/commit/11b39b16f682551ad1b2b67e497ea0709d7b7766))


### Features

* improve sliding experience ([14b62ee](https://github.com/dohooo/react-native-reanimated-carousel/commit/14b62ee3ae63bfff693891c1bfc0fa39278e2ed3))


### BREAKING CHANGES

* remove props "timingConfig", add "springConfig" with no support of duration



## [0.5.4](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-10-27)


### Bug Fixes

* onSnapToItem gives floating index ([13d6c64](https://github.com/dohooo/react-native-reanimated-carousel/commit/13d6c6485f4fa54bf944b10947f928b2cf88c7b7)), closes [#13](https://github.com/dohooo/react-native-reanimated-carousel/issues/13)



## [0.5.3-beta.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-10-27)


### Bug Fixes

* drag issues occur when auto-scrolling ([ebb0ce2](https://github.com/dohooo/react-native-reanimated-carousel/commit/ebb0ce20d35b134755b163ea9ffc0e85daffdb9c)), closes [#13](https://github.com/dohooo/react-native-reanimated-carousel/issues/13)



## [0.5.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-10-19)



## [0.5.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-10-09)


### Features

* add onScrollBegin/onScrollEnd props ([3180696](https://github.com/dohooo/react-native-reanimated-carousel/commit/31806966ca644d086bfea7a872108b1006e50ecf))



# [0.5.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-10-08)


### Bug Fixes

* fix onSnapToItem no call when auto playing ([4953b98](https://github.com/dohooo/react-native-reanimated-carousel/commit/4953b9805beb5a591ee0b261c81c7dd623337a75))
* onSnapToItem not called if loop={false} ([1ce57f4](https://github.com/dohooo/react-native-reanimated-carousel/commit/1ce57f4e0201c2d50a1ce754f08b6afb5661a6a1))


### Features

* add goToIndex method ([b33bb78](https://github.com/dohooo/react-native-reanimated-carousel/commit/b33bb788e5849615b5c90b122633507ec0f2bfbf))



## [0.4.4](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-30)


### Bug Fixes

* fix animation bug ([d3b6831](https://github.com/dohooo/react-native-reanimated-carousel/commit/d3b683169cca9fba3083b52133758a7a39dcf25e))



## [0.4.3](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-09)


### Bug Fixes

* sliding causes problems with sliding errors when auto playing ([37f6565](https://github.com/dohooo/react-native-reanimated-carousel/commit/37f656539fed21f5a7d4148af02954b97f95a7f7))



## [0.4.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-09)


### Bug Fixes

* fixed scrolling on Android ([d253b3c](https://github.com/dohooo/react-native-reanimated-carousel/commit/d253b3cc30538a2702dceeb2be37c99fb2ee2d67))



## [0.4.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-08)


### Bug Fixes

* handles boundary cases for raw data ([4386bfd](https://github.com/dohooo/react-native-reanimated-carousel/commit/4386bfd59553c2df53c3987c539e299fac52a491))



# [0.4.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-08)


### Features

* add onSnapToItem props,should get current item info ([6ae05fc](https://github.com/dohooo/react-native-reanimated-carousel/commit/6ae05fcaa382c4b406d135c66bebdaa614c07b67))



## [0.3.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-08)


### Bug Fixes

* after data props update carousel not be can swipe ([dd00932](https://github.com/dohooo/react-native-reanimated-carousel/commit/dd00932b65df0e7efdc10e4f4e72cf8da5ca8456))



# [0.3.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-08)


### Features

* add loop props,control wheter loop playback ([97cf2b9](https://github.com/dohooo/react-native-reanimated-carousel/commit/97cf2b99c9279fc65da323e35b3461bc1df64b15))



## [0.2.2](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-07)



## [0.2.1](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-07)


### Bug Fixes

* fix calculation errors ([15b2119](https://github.com/dohooo/react-native-reanimated-carousel/commit/15b21192b510902e833900b5fc44affd78941614))



# [0.2.0](https://github.com/dohooo/react-native-reanimated-carousel/compare/v1.1.0...v1.2.0-beta.3) (2021-09-07)


### Bug Fixes

* fix algorithm errors ([af61df8](https://github.com/dohooo/react-native-reanimated-carousel/commit/af61df8da51c56940449c4f1c50440f567e33c46))


### Features

* export types ([2dcceb8](https://github.com/dohooo/react-native-reanimated-carousel/commit/2dcceb8001eff1b16c64399a4ca1b372ac9e8026))
* first commit of carousel component ([af964e3](https://github.com/dohooo/react-native-reanimated-carousel/commit/af964e331ae7b4363a407451344d9ffc1369b91f))


# Custom Animation

After some effort, we finally implemented custom animation in v2, now we just need to implement a callback function of type `TAnimationStyle` and pass it to the `customAnimation` property of `Carousel`.

## Prepare

```
type TAnimationStyle = (value: number) => Animated.AnimatedStyleProp<ViewStyle>;
```

This function will be called in each item and accepts a parameter `value` indicating the position of the current item relative to `window`. The following picture shows the relationship between `value` and position

<img src="././../assets/custom-animation-sketch.png" width="300"/>

After getting the `value`, we only need to describe how the item is displayed in the corresponding position, and the rest is handed over to `Animated` to execute.

### Tips

-   Don't forget to set `zIndex`

---

## Let's get started!

Here are a few examples.

### Parallax

<a href="../exampleExpo/src/pages/advanced-parallax/index.tsx">
    <img src="././../assets/advanced-parallax.gif" width="300"/>  
</a>

```ts
const animationStyle: TAnimationStyle = React.useCallback((value: number) => {
    'worklet';

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const translateX = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_WIDTH * 0.5, 0, PAGE_WIDTH]
    );

    return {
        transform: [{ translateX }],
        zIndex,
    };
}, []);

<Carousel
    style={{ width: screen.width, height: 240 }}
    width={screen.width}
    data={[...new Array(6).keys()]}
    customAnimation={animationStyle}
    renderItem={({ index, animationValue }) => {
        return (
            <CustomItem
                key={index}
                index={index}
                animationValue={animationValue}
            />
        );
    }}
/>;

const CustomItem = ({ index, animationValue }) => {
    const maskStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animationValue.value,
            [-1, 0, 1],
            ['#000000dd', 'transparent', '#000000dd']
        );

        return {
            backgroundColor,
        };
    }, [animationValue]);

    return (
        <View style={{ flex: 1 }}>
            <SBItem key={index} index={index} style={{ borderRadius: 0 }} />
            <Animated.View
                pointerEvents="none"
                style={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                    maskStyle,
                ]}
            />
        </View>
    );
};
```

In order to implement some animation effects outside `Carousel`, such as `MaskView`, we pass the animation value calculated inside each Item to the outside through `renderItem`.

### ScaleFadeInOut

<a href="../exampleExpo/src/pages/scale-fade-in-out/index.tsx">
    <img src="././../assets/scale-fade-in-out.gif" width="300"/>  
</a>

```ts
const animationStyle: TAnimationStyle = React.useCallback((value: number) => {
    'worklet';

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
    const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

    return {
        transform: [{ scale }],
        zIndex,
        opacity,
    };
}, []);

<Carousel
    style={{
        width: screen.width,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
    }}
    width={screen.width * 0.7}
    height={240 * 0.7}
    data={[...new Array(6).keys()]}
    customAnimation={animationStyle}
    renderItem={({ index }) => {
        return <SBItem key={index} index={index} />;
    }}
/>;
```

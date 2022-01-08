## 自定义动画

经过一些努力，我们终于在v2版本中实现了自定义动画，下面给大家带来几个例子

### 视差效果

<a href="../example/src/advanced-parallax/index.tsx">
    <img src="././../assets/advanced-parallax.gif" width="300"/>  
</a>

```ts
const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
        'worklet';

        const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
        const translateX = interpolate(
            value,
            [-2, 0, 1],
            [-PAGE_WIDTH, 0, PAGE_WIDTH]
        );

        return {
            transform: [{ translateX }],
            zIndex,
        };
    },
    []
);

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
}

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
/>
```

### 缩放渐入渐出效果

```ts
const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
        'worklet';

        const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
        const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
        const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

        return {
            transform: [{ scale }],
            zIndex,
            opacity,
        };
    },
    []
);

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
        return (
            <SBItem
                key={index}
                index={index}
                style={{
                    borderWidth: 5,
                    borderColor: Colors.orange50,
                }}
            />
        );
    }}
/>
```
import React, { useRef, useEffect } from "react";
import {
   View,
   Text,
   ScrollView,
   TouchableOpacity,
   Dimensions,
   Image,
   StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   withSpring,
   interpolate,
   withTiming,
   useAnimatedRef,
   Easing,
   measure,
   useDerivedValue,
} from "react-native-reanimated";
import txt from "./text";
import { getBottomSpace } from "react-native-iphone-x-helper";

const { width } = Dimensions.get("window");

const BUTTON_TOP_MARGIN = 20;

const ORIGINAL_BUTTON_WIDTH = width - 100;
const BUTTON_SIZE = 36;

const COORDS = { x: 0, y: 0 };

export default function App() {
   const buttonRef = useRef(null);
   const cartRef = useRef(null);

   const cartCoords = useSharedValue({ ...COORDS });
   const ballCoords = useSharedValue({ ...COORDS });

   const ballOpacity = useSharedValue(0);
   const ballAnimation = useSharedValue(0);
   const buttonWidth = useSharedValue(1);
   const buttonOpacity = useSharedValue(1);

   function calcBezier(interpolatedValue, p0, p1, p2) {
      "worklet";
      return Math.round(
         Math.pow(1 - interpolatedValue, 2) * p0 +
            2 * (1 - interpolatedValue) * interpolatedValue * p1 +
            Math.pow(interpolatedValue, 2) * p2
      );
   }

   const ballStyle = useAnimatedStyle(() => {
      const cart = cartCoords.value;
      const ball = ballCoords.value;

      const translateX = calcBezier(
         ballAnimation.value,
         ball.x,
         ball.x,
         cart.x
      );
      const translateY = calcBezier(
         ballAnimation.value,
         ball.y,
         cart.y,
         cart.y
      );

      return {
         opacity: ballOpacity.value,
         transform: [
            { translateX },
            { translateY },
            { scale: interpolate(ballAnimation.value, [0, 1], [1, 0.5]) },
         ],
      };
   });

   const buttonStyle = useAnimatedStyle(() => {
      return {
         opacity: buttonOpacity.value,
         width: interpolate(
            buttonWidth.value,
            [0, 1],
            [BUTTON_SIZE, ORIGINAL_BUTTON_WIDTH]
         ),
      };
   });

   const labelStyle = useAnimatedStyle(() => {
      return {
         opacity: buttonWidth.value,
      };
   });

   function setBallPosition(y) {
      ballCoords.value = { x: width / 2 - BUTTON_SIZE / 2, y };
   }

   return (
      <View style={styles.flex}>
         <View style={styles.header}>
            <View
               ref={cartRef}
               onLayout={({ nativeEvent }) => {
                  console.log(nativeEvent);

                  //Precalculate cart button position
                  if (
                     cartRef.current &&
                     !cartCoords.value.x &&
                     !cartCoords.value.y
                  )
                     cartRef.current.measure(
                        (_x, _y, _width, _height, px, py) => {
                           cartCoords.value = { x: px, y: py };
                        }
                     );
               }}
            >
               <Feather name="shopping-cart" size={20} />
            </View>
         </View>

         <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            <Image
               resizeMode="contain"
               style={styles.image}
               source={require("./assets/chair.png")}
            />
            <Text>{txt}</Text>

            {/** Wrapped into View since TouchableOpacity can't animate opacity */}
            <Animated.View style={[styles.buttonContainer, buttonStyle]}>
               <TouchableOpacity
                  ref={buttonRef}
                  activeOpacity={1}
                  style={styles.button}
                  onPress={() => {
                     buttonRef.current.measure(
                        (_x, _y, _width, _height, _px, py) => {
                           setBallPosition(py);

                           buttonWidth.value = withTiming(
                              0,
                              {
                                 duration: 300,
                                 easing: Easing.bezier(0.11, 0, 0.5, 0),
                              },
                              () => {
                                 ballOpacity.value = 1;
                                 buttonOpacity.value = 0;
                                 ballAnimation.value = withTiming(1, {
                                    duration: 900,
                                    easing: Easing.bezier(0.12, 0, 0.39, 0),
                                 });
                              }
                           );
                        }
                     );
                  }}
               >
                  <Animated.Text style={[styles.buttonLabel, labelStyle]}>
                     Add to Cart
                  </Animated.Text>
               </TouchableOpacity>
            </Animated.View>
         </ScrollView>

         <Animated.View style={[styles.cartItemBall, ballStyle]} />
      </View>
   );
}

const styles = StyleSheet.create({
   flex: {
      flex: 1,
   },
   header: {
      alignItems: "flex-end",
      marginTop: 30,
      paddingHorizontal: 20,
      backgroundColor: "rgba(0,0,0,0.2)",
      paddingVertical: 10,
   },
   content: {
      paddingVertical: 30,
      paddingHorizontal: 20,
      paddingBottom: getBottomSpace(),
   },
   image: {
      height: 300,
      width: "100%",
   },
   buttonContainer: {
      marginTop: BUTTON_TOP_MARGIN,
      borderRadius: BUTTON_SIZE / 2,
      width: ORIGINAL_BUTTON_WIDTH,
      height: BUTTON_SIZE,
      alignSelf: "center",
      overflow: "hidden",
   },
   button: {
      backgroundColor: "blue",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
   },
   buttonLabel: {
      color: "white",
      width: ORIGINAL_BUTTON_WIDTH,
      textAlign: "center",
   },
   cartItemBall: {
      position: "absolute",
      height: BUTTON_SIZE,
      width: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: "blue",
   },
});

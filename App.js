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
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
   useAnimatedStyle,
   useSharedValue,
   interpolate,
   withTiming,
   Easing,
} from "react-native-reanimated";
import {
   getBottomSpace,
   getStatusBarHeight,
} from "react-native-iphone-x-helper";

const colorPrimary = "rgb(11,70,245)";

const { width } = Dimensions.get("window");

const ORIGINAL_BUTTON_WIDTH = width - 100;
const BUTTON_SIZE = 50;

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
         cart.y - 10,
         cart.y - 10
      );

      return {
         opacity: ballOpacity.value,
         transform: [
            { translateX },
            { translateY },
            { scale: interpolate(ballAnimation.value, [0, 1], [1, 0.2]) },
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
         <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.flex}
         >
            <View>
               <View style={styles.imageContainer}>
                  <Image
                     resizeMode="contain"
                     style={styles.image}
                     source={require("./assets/headphones.png")}
                  />
               </View>
               <View style={styles.content}>
                  <Text style={styles.title}>
                     4TWIGGERS NEO - (2021 Edition)
                  </Text>
                  <Text style={styles.description}>- Unparalleled sound</Text>
                  <Text style={styles.description}>- Ear comfort</Text>
                  <Text style={styles.description}>- Bluetooth 5.0</Text>
                  <Text style={styles.description}>- 15 Hour battery life</Text>
                  <Text style={styles.description}>- Quick charge</Text>
               </View>
            </View>

            <View>
               <View>
                  <View style={styles.divider} />
                  <View style={styles.priceRow}>
                     <Text style={styles.priceKey}>Was: </Text>
                     <Text style={styles.priceOld}>$ 350</Text>
                  </View>
                  <View style={styles.priceRow}>
                     <Text style={styles.priceKey}>Price: </Text>
                     <Text style={styles.price}>$ 199</Text>
                  </View>
               </View>

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
            </View>
         </ScrollView>

         <View style={styles.navContainer}>
            <View style={styles.navButton}>
               <FontAwesome5
                  size={15}
                  color="rgb(115,114,131)"
                  name="chevron-left"
               />
            </View>
            <View
               style={styles.navButton}
               ref={cartRef}
               onLayout={() => {
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
               <FontAwesome5
                  color="rgb(115,114,131)"
                  name="shopping-cart"
                  size={15}
               />
            </View>
         </View>

         <Animated.View style={[styles.cartItemBall, ballStyle]} />
      </View>
   );
}

const styles = StyleSheet.create({
   flex: {
      flex: 1,
   },
   navContainer: {
      top: getStatusBarHeight() + 40,
      position: "absolute",
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
   },
   navButton: {
      height: 44,
      width: 44,
      backgroundColor: "white",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
   },
   scrollContent: {
      flexGrow: 1,
      justifyContent: "space-between",
      paddingBottom: getBottomSpace() || 20,
   },
   content: {
      paddingHorizontal: 20,
   },
   imageContainer: {
      backgroundColor: "rgb(242,242,242)",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      marginBottom: 40,
      alignItems: "center",
      justifyContent: "center",
   },
   image: {
      height: 300,
      width: "100%",
   },
   divider: {
      width: "100%",
      height: 1,
      backgroundColor: "#8a8a8a",
      marginBottom: 10,
      opacity: 0.2,
   },
   title: {
      fontSize: 30,
      fontWeight: "bold",
      color: "#2b2b2b",
      marginBottom: 10,
   },
   description: {
      color: "#454545",
      fontSize: 14,
      marginVertical: 5,
   },
   priceKey: {
      color: "#454545",
      width: 40,
   },
   priceContainer: {
      marginLeft: 20,
      marginTop: 30,
   },
   priceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 20,
   },
   priceOld: {
      color: "#595959",
      fontWeight: "bold",
      fontSize: 18,
      textDecorationLine: "line-through",
      opacity: 0.7,
   },
   price: {
      color: "#454545",
      fontSize: 20,
      fontWeight: "bold",
   },
   buttonContainer: {
      marginTop: 10,
      borderRadius: BUTTON_SIZE / 2,
      width: ORIGINAL_BUTTON_WIDTH,
      height: BUTTON_SIZE,
      alignSelf: "center",
      overflow: "hidden",
   },
   button: {
      backgroundColor: colorPrimary,
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
      backgroundColor: colorPrimary,
   },
});

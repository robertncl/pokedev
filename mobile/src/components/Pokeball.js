import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Pokeball({ size = 32, color = '#ee5253', spinning = false }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spinning) return;
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [spinning, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={spinning ? { transform: [{ rotate }] } : undefined}>
      <MaterialCommunityIcons name="pokeball" size={size} color={color} />
    </Animated.View>
  );
}

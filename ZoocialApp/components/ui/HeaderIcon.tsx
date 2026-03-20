import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const logoImg = require('@/assets/images/react-logo.png'); // Placeholder, update later if we get the real asset

export function HeaderIcon({ size = 100 }: { size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* We are using a placeholder image logic here.
          In a real scenario, this would be an SVG or local PNG of the dog/cat logo.
          For now, we simulate the blue bubble shape with an icon inside. */}
      <View style={[styles.bubble, { borderRadius: size * 0.2 }]}>
         <Image 
            source={logoImg} 
            style={{ width: size * 0.6, height: size * 0.6, tintColor: 'white' }} 
            resizeMode="contain" 
         />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  bubble: {
    backgroundColor: '#0c5cb3', // The blue from the logo
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // The "tail" of the speech bubble can be added with an absolute positioned triangle,
    // but for simplicity we'll stick to a rounded box for this proxy component.
  }
});

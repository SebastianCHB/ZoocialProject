import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const logoImg = require('@/assets/images/logosolo.png');

export function HeaderIcon({ size = 100 }: { size?: number }) {
  return (
         <Image 
            source={logoImg} 
            style={{ width: size * 0.9, height: size * 0.9 }}   
            resizeMode="contain" 
         />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  bubble: {
    backgroundColor: '#0c5cb3', 
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

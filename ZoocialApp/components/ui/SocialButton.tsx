import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, ViewStyle, TextStyle } from 'react-native';

type SocialProvider = 'google' | 'facebook';

type SocialButtonProps = {
  provider: SocialProvider;
  onPress: () => void;
  style?: ViewStyle;
};

export function SocialButton({ provider, onPress, style }: SocialButtonProps) {
  const isGoogle = provider === 'google';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isGoogle ? styles.buttonGoogle : styles.buttonFacebook,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Placeholders for actual icons */}
      <Text style={[styles.iconText, !isGoogle && styles.textWhite]}>
         {isGoogle ? 'G' : 'f'}
      </Text>
      <Text style={[styles.text, !isGoogle && styles.textWhite]}>
        {isGoogle ? 'Google' : 'Facebook'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1, // Useful for having them side-by-side
    marginHorizontal: 4,
  },
  buttonGoogle: {
    backgroundColor: '#ffffff',
    borderColor: '#c9ccd1',
  },
  buttonFacebook: {
    backgroundColor: '#1877f2', // Facebook Blue
    borderColor: '#1877f2',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#ea4335', // Google Red proxy
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  textWhite: {
    color: '#fff',
  },
});

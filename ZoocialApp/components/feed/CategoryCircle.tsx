import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CategoryCircleProps = {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  isActive?: boolean;
  onPress: () => void;
};

export function CategoryCircle({ title, iconName, isActive, onPress }: CategoryCircleProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.circle, isActive && styles.activeCircle]}>
        <Ionicons 
          name={iconName} 
          size={32} 
          color={isActive ? '#ffffff' : '#4a4a4a'} 
        />
      </View>
      <Text style={[styles.title, isActive && styles.activeTitle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 20,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ebdffc', // Light purple from the screenshot 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCircle: {
    backgroundColor: '#0c5cb3', // Deep blue when active
  },
  title: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  activeTitle: {
    fontWeight: 'bold',
    color: '#0c5cb3',
  }
});

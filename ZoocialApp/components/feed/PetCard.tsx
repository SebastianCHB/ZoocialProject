import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PetCardProps = {
  name: string;
  breed: string;
  age: string;
  gender: string;
  imageUrl?: string;
  onPress?: () => void;
};

const { width } = Dimensions.get('window');
const cardWidth = width * 0.42; // Two cards per row with padding

export function PetCard({ name, breed, age, gender, imageUrl, onPress }: PetCardProps) {
  const isMale = gender.toLowerCase() === 'macho';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
             <Ionicons name="paw" size={40} color="#c9ccd1" />
          </View>
        )}
        <View style={styles.genderBadge}>
           <Ionicons 
             name={isMale ? 'male' : 'female'} 
             size={14} 
             color={isMale ? '#0c5cb3' : '#e63946'} 
           />
        </View>
      </View>
      
      <View style={styles.infoContainer}>
         <Text style={styles.name} numberOfLines={1}>{name}</Text>
         <Text style={styles.breed} numberOfLines={1}>{breed}</Text>
         <Text style={styles.age} numberOfLines={1}>{age}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  breed: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  age: {
    fontSize: 12,
    color: '#8e9094',
  }
});

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

import { getFullImageUrl } from '../../utils/imageUtils';

type PostCardProps = {
  authorName: string;
  authorPet: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
};

export function PostCard({ authorName, authorPet, content, imageUrl, likes, comments, shares }: PostCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#333" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.author}>{authorName}</Text>
          <Text style={styles.subAuthor}>Posted by {authorPet}</Text>
        </View>
        <TouchableOpacity style={styles.menuIcon}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{content}</Text>

      {getFullImageUrl(imageUrl) && (
        <Image
          source={{ uri: getFullImageUrl(imageUrl) }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{shares}</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.actionButtonPaw}>
          <Ionicons name="paw" size={20} color="#b3b3b3" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  author: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subAuthor: {
    fontSize: 13,
    color: '#8e9094',
  },
  menuIcon: {
    padding: 8,
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  actionButtonPaw: {
    padding: 4,
  }
});

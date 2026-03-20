import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const VALID_TABS = ['index', 'pets', 'chat', 'store', 'profile'];

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type IconMap = Record<string, { focused: IoniconName; unfocused: IoniconName }>;

const ICON_MAP: IconMap = {
  index: { focused: 'home', unfocused: 'home-outline' },
  pets: { focused: 'paw', unfocused: 'paw-outline' },
  chat: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  store: { focused: 'storefront', unfocused: 'storefront-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  // Whitelist: only render the 5 tabs we care about
  const visibleRoutes = state.routes.filter(r => VALID_TABS.includes(r.name));

  return (
    <View style={styles.tabBar}>
      {visibleRoutes.map((route) => {
        const actualIndex = state.routes.findIndex(r => r.key === route.key);
        const isFocused = state.index === actualIndex;
        const icons = ICON_MAP[route.name];
        if (!icons) return null;
        const iconName: IoniconName = isFocused ? icons.focused : icons.unfocused;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            {isFocused ? (
              <View style={styles.activeCircle}>
                <Ionicons name={iconName} size={26} color="#ffffff" />
              </View>
            ) : (
              <Ionicons name={iconName} size={26} color="#a0a8b4" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="pets" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="store" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const BAR_HEIGHT = 68;
const CIRCLE = 58;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 28,
    left: 20,
    right: 20,
    height: BAR_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: BAR_HEIGHT / 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    alignItems: 'center',
    overflow: 'visible',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
    overflow: 'visible',
  },
  activeCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#0c5cb3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -(CIRCLE - BAR_HEIGHT) / 2 - 4,
    shadowColor: '#0c5cb3',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 8,
  },
});

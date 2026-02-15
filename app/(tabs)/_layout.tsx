import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

function TabBarIcon({ name, color }: { name: keyof typeof MaterialIcons.glyphMap; color: string }) {
  return <MaterialIcons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5A1F',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: Platform.select({
          web: {
            maxWidth: 448,
            marginHorizontal: 'auto',
            width: '100%',
          },
          default: undefined,
        }),
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <TabBarIcon name="notifications" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
      {/* Hide old tab screens that are now separate routes */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}

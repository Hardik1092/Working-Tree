// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { colors } from '@/theme/colors';

// const VISIBLE_TABS = ['home', 'create', 'search', 'profile'];
// const TAB_COUNT = 4;
// const TAB_BAR_RADIUS = 16;
// const TAB_BAR_PADDING_TOP = 8;

// const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
//   home: 'home',
//   create: 'add-circle-outline',
//   search: 'search',
//   profile: 'person-outline',
// };

// const TAB_LABELS: Record<string, string> = {
//   home: 'Home',
//   create: 'New',
//   search: 'Search',
//   profile: 'Profile',
// };

// const BOTTOM_INSET_FALLBACK = 32;

// export function CustomTabBar({ state, descriptors, navigation }: any) {
//   const insets = useSafeAreaInsets();
//   const { width: windowWidth } = useWindowDimensions();
//   const theme = colors.light;
//   const paddingBottom = Math.max(BOTTOM_INSET_FALLBACK, insets.bottom);
//   const tabItemWidth = windowWidth / TAB_COUNT;

//   const visibleRoutes = state.routes.filter((r: { name: string }) => VISIBLE_TABS.includes(r.name));

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: theme.card,
//           paddingTop: TAB_BAR_PADDING_TOP,
//           paddingBottom,
//           ...Platform.select({
//             ios: {
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: -2 },
//               shadowOpacity: 0.06,
//               shadowRadius: 8,
//             },
//             android: { elevation: 8 },
//           }),
//         },
//       ]}
//     >
//       <View style={styles.row}>
//         {visibleRoutes.map((route: { key: string; name: string }, index: number) => {
//           const currentRoute = state.routes[state.index];
//           const isFocused = currentRoute && currentRoute.key === route.key;
//           const color = isFocused ? theme.primary : theme.muted;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: 'tabPress',
//               target: route.key,
//               canPreventDefault: true,
//             });
//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }
//           };

//           const iconName = TAB_ICONS[route.name] ?? 'ellipse-outline';
//           const label = TAB_LABELS[route.name] ?? route.name;

//             return (
//               <TouchableOpacity
//                 key={route.key}
//                 onPress={onPress}
//                 style={[styles.tabItem, { width: tabItemWidth }]}
//                 activeOpacity={0.7}
//                 accessibilityRole="button"
//                 accessibilityState={isFocused ? { selected: true } : {}}
//                 accessibilityLabel={label}
//               >
//               <Ionicons name={iconName} size={24} color={color} style={styles.icon} />
//               <Text style={[styles.label, { color }]} numberOfLines={1}>
//                 {label}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     borderTopLeftRadius: TAB_BAR_RADIUS,
//     borderTopRightRadius: TAB_BAR_RADIUS,
//     overflow: 'hidden',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//   },
//   tabItem: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   icon: { marginBottom: 2 },
//   label: { fontSize: 11 },
// });









import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  useWindowDimensions 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

const VISIBLE_TABS = ['home', 'create', 'search', 'profile'];
const TAB_COUNT = 4;
const TAB_BAR_RADIUS = 16;
const TAB_BAR_PADDING_TOP = 8;

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home',
  create: 'add-circle-outline',
  search: 'search',
  profile: 'person-outline',
};

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  create: 'New',
  search: 'Search',
  profile: 'Profile',
};

const BOTTOM_INSET_FALLBACK = 32;

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const theme = colors.light;
  const paddingBottom = Math.max(BOTTOM_INSET_FALLBACK, insets.bottom);
  
  const visibleRoutes = state.routes.filter((r: { name: string }) => VISIBLE_TABS.includes(r.name));
  const tabItemWidth = windowWidth / visibleRoutes.length; // Equal width based on visible count

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          paddingTop: TAB_BAR_PADDING_TOP,
          paddingBottom,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
      ]}
    >
      <View style={styles.row}>
        {visibleRoutes.map((route: { key: string; name: string }, index: number) => {
          const currentRoute = state.routes[state.index];
          const isFocused = currentRoute && currentRoute.key === route.key;
          const color = isFocused ? theme.primary : theme.muted;

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

          const iconName = TAB_ICONS[route.name] ?? 'ellipse-outline';
          const label = TAB_LABELS[route.name] ?? route.name;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, { width: tabItemWidth }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              <Ionicons name={iconName} size={24} color={color} style={styles.icon} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopLeftRadius: TAB_BAR_RADIUS,
    borderTopRightRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: { 
    marginBottom: 2 
  },
  label: { 
    fontSize: 11 
  },
});
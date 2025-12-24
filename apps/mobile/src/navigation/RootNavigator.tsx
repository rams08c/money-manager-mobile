import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

/**
 * Root navigator - switches between auth and main stacks based on auth state
 */
export function RootNavigator() {
    const { state } = useAuth();

    // Show loading screen while checking auth
    if (state.isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.title}>Money Manager</Text>
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {state.isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    loader: {
        marginTop: 20,
    },
});

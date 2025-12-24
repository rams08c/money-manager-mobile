import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AppHeader } from '../components/AppHeader';

export function HomeScreen({ navigation }: any) {
    const { logout, state } = useAuth();

    const navigationItems = [
        { label: 'Transactions', screen: 'Transactions', icon: '💳', color: '#4F46E5', lightColor: '#818CF8' }, // Indigo
        { label: 'Accounts', screen: 'Accounts', icon: '🏦', color: '#10B981', lightColor: '#34D399' }, // Emerald
        { label: 'Budgets', screen: 'Budgets', icon: '📊', color: '#F59E0B', lightColor: '#FBBF24' }, // Amber
        { label: 'Reports', screen: 'Reports', icon: '📈', color: '#8B5CF6', lightColor: '#A78BFA' }, // Violet
        { label: 'Categories', screen: 'Categories', icon: '🏷️', color: '#EC4899', lightColor: '#F472B6' }, // Pink
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Unified Header */}
            <AppHeader navigation={navigation} />

            {/* Primary Action */}
            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('TransactionType')}
            >
                <Text style={styles.primaryButtonIcon}>+</Text>
                <Text style={styles.primaryButtonText}>Add Transaction</Text>
            </TouchableOpacity>

            {/* Quick Actions - Grid Layout */}
            <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
                <View style={styles.cardsGrid}>
                    {navigationItems.map((item) => (
                        <TouchableOpacity
                            key={item.screen}
                            style={[styles.actionCard, { backgroundColor: item.color }]}
                            onPress={() => navigation.navigate(item.screen)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cardIcon}>{item.icon}</Text>
                            <Text style={styles.cardLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    contentContainer: {
        paddingBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: 16, // Button radius
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButtonIcon: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: '600',
        marginRight: 8,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    quickActionsSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600', // Semibold
        color: '#64748B', // Slate-500
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    actionCard: {
        width: '48%', // 2 cards per row with gap
        height: 120,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardIcon: {
        fontSize: 32,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

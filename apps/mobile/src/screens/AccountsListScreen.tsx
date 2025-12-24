import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { accountsAPI } from '../api/accounts';
import { Account } from '../api/types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/currency';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    AccountsList: undefined;
    AccountForm: undefined; // Assuming you have an AccountForm screen
    // Add other screen names and their params here
};

type AccountsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AccountsList'>;

interface AccountsListScreenProps {
    navigation: AccountsListScreenNavigationProp;
}

export function AccountsListScreen({ navigation }: AccountsListScreenProps) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchAccounts();
        }, [])
    );

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountsAPI.getAccounts();
            setAccounts(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const data = await accountsAPI.getAccounts();
            setAccounts(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setRefreshing(false);
        }
    };

    const getAccountTypeIcon = (type: string) => {
        switch (type) {
            case 'CASH':
                return '💰';
            case 'BANK':
                return '🏦';
            case 'WALLET':
                return '📱';
            case 'CREDIT_CARD':
                return '💳';
            default:
                return '💼';
        }
    };

    const renderAccount = ({ item }: { item: Account }) => {
        const balance = item.balance || item.openingBalance;
        const isNegative = parseFloat(balance) < 0;

        return (
            <TouchableOpacity
                style={styles.accountItem}
                onPress={() => navigation.navigate('AccountForm', { account: item })}
            >
                <View style={styles.accountIcon}>
                    <Text style={styles.iconText}>{getAccountTypeIcon(item.type)}</Text>
                </View>
                <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{item.name}</Text>
                    <Text style={styles.accountType}>
                        {item.type.toLowerCase().replace('_', ' ')}
                    </Text>
                </View>
                <View style={styles.accountBalance}>
                    <Text style={[styles.balanceText, isNegative && styles.negativeBalance]}>
                        {formatCurrency(balance, item.currency)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptySubtitle}>Create your first account to start tracking finances</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading accounts...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={accounts}
                renderItem={renderAccount}
                keyExtractor={(item) => item.id}
                contentContainerStyle={accounts.length === 0 ? styles.emptyList : undefined}
                ListEmptyComponent={renderEmpty}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC', // Slate-50
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748B', // Slate-500
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // White
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    accountIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 17,
        fontWeight: '600', // Semibold
        color: '#0F172A', // Slate-900
        marginBottom: 4,
    },
    accountType: {
        fontSize: 13,
        color: '#64748B', // Slate-500
        textTransform: 'capitalize',
    },
    accountBalance: {
        alignItems: 'flex-end',
    },
    balanceText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A', // Slate-900
    },
    negativeBalance: {
        color: '#F43F5E', // Rose-500
    },
    emptyList: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0F172A', // Slate-900
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B', // Slate-500
        textAlign: 'center',
    },
});


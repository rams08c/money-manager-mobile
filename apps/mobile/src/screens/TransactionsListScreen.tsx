import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SectionList, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { transactionsAPI } from '../api/transactions';
import { accountsAPI } from '../api/accounts';
import { Transaction, Account } from '../api/types';
import { formatSignedCurrency } from '../utils/currency';
import { getErrorMessage } from '../utils/errors';

interface TransactionsListScreenProps {
    navigation: any;
}

interface GroupedTransaction {
    title: string;
    data: Transaction[];
}

export function TransactionsListScreen({ navigation }: TransactionsListScreenProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter state
    const [dateRange, setDateRange] = useState<'30days' | '90days' | 'thisMonth' | 'all'>('30days');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER' | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Modal visibility state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAccountPicker, setShowAccountPicker] = useState(false);

    // Fetch data on screen focus
    useFocusEffect(
        React.useCallback(() => {
            fetchAccounts();
            fetchTransactions();
        }, [])
    );

    // Re-fetch when filters change
    useEffect(() => {
        if (!loading) {
            fetchTransactions();
        }
    }, [dateRange, selectedAccountId, selectedType]);

    const fetchAccounts = async () => {
        try {
            const data = await accountsAPI.getAccounts();
            setAccounts(data);
        } catch (error) {
            // Silent fail - filters still work without account names
        }
    };

    const getDateRangeParams = (range: '30days' | '90days' | 'thisMonth' | 'all') => {
        const today = new Date();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        switch (range) {
            case '30days': {
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                return { startDate: formatDate(thirtyDaysAgo), endDate: formatDate(today) };
            }
            case '90days': {
                const ninetyDaysAgo = new Date(today);
                ninetyDaysAgo.setDate(today.getDate() - 90);
                return { startDate: formatDate(ninetyDaysAgo), endDate: formatDate(today) };
            }
            case 'thisMonth': {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                return { startDate: formatDate(firstDay), endDate: formatDate(lastDay) };
            }
            case 'all':
            default:
                return {};
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const dateParams = getDateRangeParams(dateRange);
            const data = await transactionsAPI.getTransactions({
                ...dateParams,
                accountId: selectedAccountId || undefined,
                type: selectedType || undefined,
            });
            setTransactions(data);
            groupByDate(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const dateParams = getDateRangeParams(dateRange);
            const data = await transactionsAPI.getTransactions({
                ...dateParams,
                accountId: selectedAccountId || undefined,
                type: selectedType || undefined,
            });
            setTransactions(data);
            groupByDate(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setRefreshing(false);
        }
    };

    // Helper: Check if transaction is part of a transfer pair
    const isTransferPair = (transaction: Transaction): boolean => {
        return transaction.type === 'TRANSFER' && !!transaction.linkedTransactionId;
    };

    // Helper: Find linked transaction
    const getLinkedTransaction = (transactionId: string, txns: Transaction[]): Transaction | undefined => {
        return txns.find(t => t.id === transactionId);
    };

    const groupByDate = (txns: Transaction[]) => {
        // Filter out duplicate transfers - keep only one side of each transfer pair
        // Keep the transaction with the smaller ID (lexicographically) for consistency
        const filteredTxns = txns.filter((txn) => {
            if (!isTransferPair(txn)) {
                return true; // Keep all non-transfer transactions
            }

            // For transfers, only keep if this ID is smaller than linked ID
            const linkedId = txn.linkedTransactionId;
            if (!linkedId) {
                return true; // Keep if no linked ID (shouldn't happen for transfers)
            }

            return txn.id < linkedId;
        });

        // Group transactions by date
        const groups: { [key: string]: Transaction[] } = {};

        filteredTxns.forEach((txn) => {
            const date = new Date(txn.transactionDate);
            const dateKey = formatDateKey(date);

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(txn);
        });

        // Convert to array and sort by date (newest first)
        const grouped: GroupedTransaction[] = Object.keys(groups)
            .sort((a, b) => {
                const dateA = new Date(groups[a][0].transactionDate);
                const dateB = new Date(groups[b][0].transactionDate);
                return dateB.getTime() - dateA.getTime();
            })
            .map((dateKey) => ({
                title: dateKey,
                data: groups[dateKey],
            }));

        setGroupedTransactions(grouped);
    };

    const formatDateKey = (date: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateStr = date.toDateString();
        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'INCOME':
                return '↓';
            case 'EXPENSE':
                return '↑';
            case 'TRANSFER':
                return '⇄';
            default:
                return '•';
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'INCOME':
                return '#10B981'; // Emerald-500
            case 'EXPENSE':
                return '#F43F5E'; // Rose-500
            case 'TRANSFER':
                return '#4F46E5'; // Indigo-600
            default:
                return '#64748B'; // Slate-500
        }
    };

    const formatAmount = (transaction: Transaction) => {
        const amount = parseFloat(transaction.amount);
        const currencyCode = transaction.account?.currency || 'USD';

        return formatSignedCurrency(amount, currencyCode, transaction.type);
    };

    // Get transfer display text
    const getTransferDisplayText = (transaction: Transaction): string => {
        if (transaction.type !== 'TRANSFER') {
            return transaction.note || transaction.category?.name || 'No description';
        }

        // For transfers, find the linked transaction to get both account names
        const linkedTxn = transaction.linkedTransactionId
            ? getLinkedTransaction(transaction.linkedTransactionId, transactions)
            : null;

        const fromAccount = transaction.account?.name || 'Unknown Account';
        const toAccount = linkedTxn?.account?.name || 'Unknown Account';

        return `From ${fromAccount} → To ${toAccount}`;
    };

    // Get transfer meta text
    const getTransferMetaText = (transaction: Transaction): string => {
        if (transaction.type !== 'TRANSFER') {
            return `${transaction.type} • ${transaction.account?.name || 'Account'}`;
        }

        const linkedTxn = transaction.linkedTransactionId
            ? getLinkedTransaction(transaction.linkedTransactionId, transactions)
            : null;

        const fromAccount = transaction.account?.name || 'Unknown';
        const toAccount = linkedTxn?.account?.name || 'Unknown';

        return `Transfer • ${fromAccount} → ${toAccount}`;
    };

    const renderTransaction = ({ item }: { item: Transaction }) => {
        const color = getTransactionColor(item.type);
        const displayText = getTransferDisplayText(item);
        const accountName = item.account?.name || 'Account';

        return (
            <TouchableOpacity
                style={[styles.transactionItem, { borderLeftColor: color }]}
                onPress={() => {
                    navigation.navigate('TransactionForm', { transaction: item });
                }}
            >
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionNote}>
                        {displayText}
                    </Text>
                    <Text style={styles.transactionMeta}>
                        {accountName}
                    </Text>
                </View>

                <Text style={[styles.amount, { color }]}>
                    {formatAmount(item)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderSectionHeader = ({ section }: { section: GroupedTransaction }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking your income and expenses</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Compact Filter Header */}
            <View style={styles.filterHeader}>
                {/* Date Range Selector */}
                <TouchableOpacity
                    style={styles.filterDropdown}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.filterDropdownText}>
                        {dateRange === '30days' ? 'Last 30 days' :
                            dateRange === '90days' ? 'Last 90 days' :
                                dateRange === 'thisMonth' ? 'This Month' : 'All Time'}
                    </Text>
                    <Text style={styles.filterDropdownIcon}>▾</Text>
                </TouchableOpacity>

                {/* Account Selector */}
                <TouchableOpacity
                    style={styles.filterDropdown}
                    onPress={() => setShowAccountPicker(true)}
                >
                    <Text style={styles.filterDropdownText}>
                        {selectedAccountId
                            ? accounts.find(a => a.id === selectedAccountId)?.name || 'Account'
                            : 'All Accounts'}
                    </Text>
                    <Text style={styles.filterDropdownIcon}>▾</Text>
                </TouchableOpacity>
            </View>

            {/* Type Segmented Control */}
            <View style={styles.typeControl}>
                <TouchableOpacity onPress={() => setSelectedType(null)}>
                    <Text style={[styles.typeOption, selectedType === null && styles.typeOptionActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <Text style={styles.typeSeparator}>•</Text>
                <TouchableOpacity onPress={() => setSelectedType('INCOME')}>
                    <Text style={[
                        styles.typeOption,
                        selectedType === 'INCOME' && styles.typeOptionActive,
                        selectedType === 'INCOME' && { color: '#34C759' }
                    ]}>
                        Income
                    </Text>
                </TouchableOpacity>
                <Text style={styles.typeSeparator}>•</Text>
                <TouchableOpacity onPress={() => setSelectedType('EXPENSE')}>
                    <Text style={[
                        styles.typeOption,
                        selectedType === 'EXPENSE' && styles.typeOptionActive,
                        selectedType === 'EXPENSE' && { color: '#FF3B30' }
                    ]}>
                        Expense
                    </Text>
                </TouchableOpacity>
                <Text style={styles.typeSeparator}>•</Text>
                <TouchableOpacity onPress={() => setSelectedType('TRANSFER')}>
                    <Text style={[
                        styles.typeOption,
                        selectedType === 'TRANSFER' && styles.typeOptionActive,
                        selectedType === 'TRANSFER' && { color: '#007AFF' }
                    ]}>
                        Transfer
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Range Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                >
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Select Period</Text>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setDateRange('30days');
                                setShowDatePicker(false);
                            }}
                        >
                            <Text style={[styles.sheetOptionText, dateRange === '30days' && styles.sheetOptionTextActive]}>
                                Last 30 days
                            </Text>
                            {dateRange === '30days' && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setDateRange('90days');
                                setShowDatePicker(false);
                            }}
                        >
                            <Text style={[styles.sheetOptionText, dateRange === '90days' && styles.sheetOptionTextActive]}>
                                Last 90 days
                            </Text>
                            {dateRange === '90days' && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setDateRange('thisMonth');
                                setShowDatePicker(false);
                            }}
                        >
                            <Text style={[styles.sheetOptionText, dateRange === 'thisMonth' && styles.sheetOptionTextActive]}>
                                This Month
                            </Text>
                            {dateRange === 'thisMonth' && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setDateRange('all');
                                setShowDatePicker(false);
                            }}
                        >
                            <Text style={[styles.sheetOptionText, dateRange === 'all' && styles.sheetOptionTextActive]}>
                                All Time
                            </Text>
                            {dateRange === 'all' && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Account Picker Modal */}
            <Modal
                visible={showAccountPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAccountPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAccountPicker(false)}
                >
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Select Account</Text>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={() => {
                                setSelectedAccountId(null);
                                setShowAccountPicker(false);
                            }}
                        >
                            <Text style={[styles.sheetOptionText, selectedAccountId === null && styles.sheetOptionTextActive]}>
                                All Accounts
                            </Text>
                            {selectedAccountId === null && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>

                        {accounts.map((account) => (
                            <TouchableOpacity
                                key={account.id}
                                style={styles.sheetOption}
                                onPress={() => {
                                    setSelectedAccountId(account.id);
                                    setShowAccountPicker(false);
                                }}
                            >
                                <Text style={[styles.sheetOptionText, selectedAccountId === account.id && styles.sheetOptionTextActive]}>
                                    {account.name}
                                </Text>
                                {selectedAccountId === account.id && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <SectionList
                sections={groupedTransactions}
                renderItem={renderTransaction}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={groupedTransactions.length === 0 ? styles.emptyList : undefined}
                ListEmptyComponent={renderEmpty}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                stickySectionHeadersEnabled={true}
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
    filterHeader: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF', // White
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // Slate-200
    },
    filterDropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF', // White
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
    },
    filterDropdownText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1C1C1E',
    },
    filterDropdownIcon: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
    },
    typeControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    typeOption: {
        fontSize: 14,
        fontWeight: '400',
        color: '#8E8E93',
    },
    typeOptionActive: {
        fontWeight: '600',
        color: '#1C1C1E',
    },
    typeSeparator: {
        fontSize: 14,
        color: '#D1D1D6',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 34,
        maxHeight: '60%',
    },
    sheetHandle: {
        width: 36,
        height: 4,
        backgroundColor: '#D1D1D6',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    sheetOptionText: {
        fontSize: 15,
        color: '#1C1C1E',
    },
    sheetOptionTextActive: {
        fontWeight: '600',
        color: '#007AFF',
    },
    checkmark: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    sectionHeader: {
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        letterSpacing: 0.3,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderLeftWidth: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    transactionInfo: {
        flex: 1,
        marginRight: 12,
    },
    transactionNote: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1C1C1E',
        marginBottom: 6,
        lineHeight: 20,
    },
    transactionMeta: {
        fontSize: 13,
        fontWeight: '400',
        color: '#8E8E93',
        lineHeight: 16,
    },
    amount: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
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
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});

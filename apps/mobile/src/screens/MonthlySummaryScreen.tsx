import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { reportsAPI } from '../api/reports';
import { MonthlySummary } from '../api/types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface MonthlySummaryScreenProps {
    navigation: any;
}

export function MonthlySummaryScreen({ navigation }: MonthlySummaryScreenProps) {
    const { state } = useAuth();
    const userCurrency = state.user?.defaultCurrency || 'USD';
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

    useEffect(() => {
        fetchSummary();
    }, [selectedMonth]);

    function getCurrentMonth(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const data = await reportsAPI.getMonthlySummary(selectedMonth);
            setSummary(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (direction: 'prev' | 'next') => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1, 1);

        if (direction === 'prev') {
            date.setMonth(date.getMonth() - 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }

        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        setSelectedMonth(`${newYear}-${newMonth}`);
    };

    const formatMonthDisplay = (month: string): string => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading report...</Text>
            </View>
        );
    }

    if (!summary) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No data for {formatMonthDisplay(selectedMonth)}</Text>
                <Text style={styles.emptySubtitle}>No transactions found for this month</Text>
            </View>
        );
    }

    const netIncomeColor = summary.netIncome >= 0 ? '#34C759' : '#FF3B30';

    return (
        <ScrollView style={styles.container}>
            {/* Month Selector */}
            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
                    <Text style={styles.monthButtonText}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>{formatMonthDisplay(selectedMonth)}</Text>
                <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
                    <Text style={styles.monthButtonText}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* Overview Cards */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>OVERVIEW</Text>

                <View style={styles.overviewCards}>
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Income</Text>
                        <Text style={styles.cardAmount}>{formatCurrency(summary.totalIncome, userCurrency)}</Text>
                        <Text style={styles.cardCount}>{summary.incomeCount} transactions</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Expenses</Text>
                        <Text style={styles.cardAmount}>{formatCurrency(summary.totalExpenses, userCurrency)}</Text>
                        <Text style={styles.cardCount}>{summary.expenseCount} transactions</Text>
                    </View>
                </View>

                <View style={styles.netCard}>
                    <Text style={styles.cardLabel}>Net Income</Text>
                    <Text style={[styles.netAmount, { color: netIncomeColor }]}>
                        {summary.netIncome >= 0 ? '+' : ''}{formatCurrency(Math.abs(summary.netIncome), userCurrency)}
                    </Text>
                </View>
            </View>

            {/* Top Categories */}
            {summary.topCategories.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TOP CATEGORIES</Text>
                    {summary.topCategories.map((category) => (
                        <View key={category.categoryId} style={styles.categoryItem}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryName}>{category.categoryName}</Text>
                                <Text style={styles.categoryAmount}>{formatCurrency(category.totalAmount, userCurrency)}</Text>
                            </View>
                            <View style={styles.progressRow}>
                                <View style={styles.progressBarContainer}>
                                    <View
                                        style={[
                                            styles.progressBar,
                                            { width: `${category.percentage}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.percentageText}>
                                    {category.percentage.toFixed(0)}%
                                </Text>
                            </View>
                            <Text style={styles.categoryMeta}>
                                {category.transactionCount} transactions
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Account Balances */}
            {summary.accountBalances.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT BALANCES</Text>
                    {summary.accountBalances.map((account) => {
                        const changeColor = account.change >= 0 ? '#34C759' : '#FF3B30';
                        const changeIcon = account.change >= 0 ? '↑' : '↓';

                        return (
                            <View key={account.accountId} style={styles.accountItem}>
                                <Text style={styles.accountName}>{account.accountName}</Text>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>Opening:</Text>
                                    <Text style={styles.accountValue}>{formatCurrency(account.openingBalance, userCurrency)}</Text>
                                </View>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>Closing:</Text>
                                    <Text style={styles.accountValue}>{formatCurrency(account.closingBalance, userCurrency)}</Text>
                                </View>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>Change:</Text>
                                    <Text style={[styles.accountChange, { color: changeColor }]}>
                                        {account.change >= 0 ? '+' : ''}{formatCurrency(Math.abs(account.change), userCurrency)} {changeIcon}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#8E8E93',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F5F5F5',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    monthButton: {
        padding: 8,
    },
    monthButtonText: {
        fontSize: 20,
        color: '#000',
    },
    monthText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    overviewCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
    },
    netCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
    },
    cardLabel: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 8,
    },
    cardAmount: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    cardCount: {
        fontSize: 12,
        color: '#8E8E93',
    },
    netAmount: {
        fontSize: 28,
        fontWeight: '600',
    },
    categoryItem: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    categoryAmount: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 3,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        minWidth: 40,
        textAlign: 'right',
    },
    categoryMeta: {
        fontSize: 13,
        color: '#8E8E93',
    },
    accountItem: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    accountName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    accountLabel: {
        fontSize: 14,
        color: '#8E8E93',
    },
    accountValue: {
        fontSize: 14,
        color: '#000',
    },
    accountChange: {
        fontSize: 14,
        fontWeight: '600',
    },
});


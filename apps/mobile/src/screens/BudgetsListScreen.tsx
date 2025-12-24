import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { budgetsAPI } from '../api/budgets';
import { Budget } from '../api/types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errors';

interface BudgetsListScreenProps {
    navigation: any;
}

export function BudgetsListScreen({ navigation }: BudgetsListScreenProps) {
    const { state } = useAuth();
    const userCurrency = state.user?.defaultCurrency || 'USD';
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

    useFocusEffect(
        React.useCallback(() => {
            fetchBudgets();
        }, [selectedMonth])
    );

    function getCurrentMonth(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const data = await budgetsAPI.getBudgets(selectedMonth);
            setBudgets(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const data = await budgetsAPI.getBudgets(selectedMonth);
            setBudgets(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setRefreshing(false);
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

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 80) return '#F43F5E'; // Rose-500 for warning/over
        return '#0F172A'; // Slate-900 for normal
    };

    const renderBudget = ({ item }: { item: Budget }) => {
        const percentage = item.percentage || 0;
        const spent = parseFloat(item.spent || '0');
        const amount = parseFloat(item.amount);
        const remaining = parseFloat(item.remaining || item.amount);
        const isOver = spent > amount;

        return (
            <TouchableOpacity
                style={styles.budgetItem}
                onPress={() => navigation.navigate('BudgetForm', { budget: item, month: selectedMonth })}
            >
                <Text style={styles.categoryName}>{item.category?.name || 'Category'}</Text>

                <View style={styles.amountRow}>
                    <Text style={styles.spentAmount}>{formatCurrency(spent, userCurrency)}</Text>
                    <Text style={styles.separator}>/</Text>
                    <Text style={styles.budgetAmount}>{formatCurrency(amount, userCurrency)}</Text>
                </View>

                <View style={styles.progressRow}>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                {
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: getProgressColor(percentage)
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.percentageText, { color: getProgressColor(percentage) }]}>
                        {percentage.toFixed(0)}%
                    </Text>
                </View>

                <Text style={[styles.remainingText, isOver && styles.overText]}>
                    {isOver ? `${formatCurrency(Math.abs(remaining), userCurrency)} over` : `${formatCurrency(remaining, userCurrency)} left`}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>No budgets for {formatMonthDisplay(selectedMonth)}</Text>
            <Text style={styles.emptySubtitle}>Set budgets to track your spending</Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('BudgetForm', { month: selectedMonth })}
            >
                <Text style={styles.createButtonText}>Create Budget</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading budgets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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

            {/* Budget List */}
            <FlatList
                data={budgets}
                renderItem={renderBudget}
                keyExtractor={(item) => item.id}
                contentContainerStyle={budgets.length === 0 ? styles.emptyList : styles.list}
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
    list: {
        padding: 16,
    },
    budgetItem: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    spentAmount: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    separator: {
        fontSize: 17,
        color: '#8E8E93',
        marginHorizontal: 6,
    },
    budgetAmount: {
        fontSize: 17,
        color: '#8E8E93',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E5EA',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'right',
    },
    remainingText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    overText: {
        color: '#FF3B30',
        fontWeight: '600',
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
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 24,
    },
    createButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});


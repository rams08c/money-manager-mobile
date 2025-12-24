import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { reportsAPI } from '../api/reports';
import { BudgetVsActual } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface BudgetVsActualScreenProps {
    navigation: any;
}

export function BudgetVsActualScreen({ navigation }: BudgetVsActualScreenProps) {
    const [month, setMonth] = useState<string>(getCurrentMonth());
    const [data, setData] = useState<BudgetVsActual[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [month]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const report = await reportsAPI.getBudgetVsActual(month);
            setData(report);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: 'under' | 'near' | 'over') => {
        switch (status) {
            case 'under':
                return '#34C759';
            case 'near':
                return '#FF9500';
            case 'over':
                return '#FF3B30';
        }
    };

    const getStatusIcon = (status: 'under' | 'near' | 'over') => {
        switch (status) {
            case 'under':
                return '✓';
            case 'near':
                return '⚠';
            case 'over':
                return '✗';
        }
    };

    const renderBudgetItem = ({ item }: { item: BudgetVsActual }) => {
        const color = getStatusColor(item.status);
        const icon = getStatusIcon(item.status);
        const isOver = item.status === 'over';

        return (
            <View style={styles.budgetItem}>
                <View style={styles.header}>
                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusIcon, { color }]}>{icon}</Text>
                        <Text style={[styles.percentage, { color }]}>
                            {item.percentageUsed.toFixed(0)}%
                        </Text>
                    </View>
                </View>
                <Text style={styles.amounts}>
                    ${item.actualAmount.toFixed(2)} / ${item.budgetAmount.toFixed(2)}
                </Text>
                <View style={styles.progressContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${Math.min(item.percentageUsed, 100)}%`,
                                backgroundColor: color,
                            },
                        ]}
                    />
                </View>
                <View style={styles.footer}>
                    <Text style={[styles.difference, { color }]}>
                        {isOver ? '-' : ''}${Math.abs(item.difference).toFixed(2)}
                    </Text>
                    <Text style={styles.label}>{isOver ? 'overspent' : 'remaining'}</Text>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No budgets found</Text>
            <Text style={styles.emptySubtitle}>Create budgets to track your spending</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading report...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Month Filter */}
            <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                    <TouchableOpacity
                        style={[styles.chip, month === getCurrentMonth() && styles.chipSelected]}
                        onPress={() => setMonth(getCurrentMonth())}
                    >
                        <Text style={[styles.chipText, month === getCurrentMonth() && styles.chipTextSelected]}>
                            This Month
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, month === getLastMonth() && styles.chipSelected]}
                        onPress={() => setMonth(getLastMonth())}
                    >
                        <Text style={[styles.chipText, month === getLastMonth() && styles.chipTextSelected]}>
                            Last Month
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Budget List */}
            <FlatList
                data={data}
                renderItem={renderBudgetItem}
                keyExtractor={(item) => item.categoryId}
                contentContainerStyle={data.length === 0 ? styles.emptyList : undefined}
                ListEmptyComponent={renderEmpty}
            />
        </View>
    );
}

// Helper functions
function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getLastMonth(): string {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    filterSection: {
        backgroundColor: '#fff',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    chipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    chipText: {
        fontSize: 13,
        color: '#333',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    budgetItem: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusIcon: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    percentage: {
        fontSize: 16,
        fontWeight: '600',
    },
    amounts: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    difference: {
        fontSize: 16,
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        color: '#666',
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

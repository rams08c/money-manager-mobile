import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { categoriesAPI } from '../api/categories';
import { Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface CategoriesListScreenProps {
    navigation: any;
}

type CategoryTypeFilter = 'ALL' | 'INCOME' | 'EXPENSE';

export function CategoriesListScreen({ navigation }: CategoriesListScreenProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [typeFilter, setTypeFilter] = useState<CategoryTypeFilter>('ALL');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesAPI.getCategories();
            setCategories(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const data = await categoriesAPI.getCategories();
            setCategories(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = (category: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await categoriesAPI.deleteCategory(category.id);
                            Alert.alert('Success', 'Category deleted successfully');
                            fetchCategories();
                        } catch (error) {
                            const message = getErrorMessage(error);
                            if (message.includes('in use') || message.includes('CATEGORY_IN_USE')) {
                                Alert.alert(
                                    'Cannot Delete',
                                    'This category is used in transactions or budgets and cannot be deleted.'
                                );
                            } else {
                                Alert.alert('Delete Failed', message);
                            }
                        }
                    },
                },
            ]
        );
    };

    const getFilteredCategories = () => {
        if (typeFilter === 'ALL') {
            return categories;
        }
        return categories.filter(cat => cat.type === typeFilter);
    };

    const getTypeColor = (type: 'INCOME' | 'EXPENSE') => {
        return type === 'INCOME' ? '#34C759' : '#FF3B30';
    };

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate('CategoryForm', { category: item })}
            onLongPress={() => handleDelete(item)}
        >
            <View style={styles.categoryContent}>
                <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />
                <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryType}>{item.type}</Text>
                </View>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏷️</Text>
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first category</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
        );
    }

    const filteredCategories = getFilteredCategories();

    return (
        <View style={styles.container}>
            {/* Type Filter */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, typeFilter === 'ALL' && styles.filterButtonActive]}
                    onPress={() => setTypeFilter('ALL')}
                >
                    <Text style={[styles.filterText, typeFilter === 'ALL' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, typeFilter === 'INCOME' && styles.filterButtonActive]}
                    onPress={() => setTypeFilter('INCOME')}
                >
                    <Text style={[styles.filterText, typeFilter === 'INCOME' && styles.filterTextActive]}>
                        Income
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, typeFilter === 'EXPENSE' && styles.filterButtonActive]}
                    onPress={() => setTypeFilter('EXPENSE')}
                >
                    <Text style={[styles.filterText, typeFilter === 'EXPENSE' && styles.filterTextActive]}>
                        Expense
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Categories List */}
            <FlatList
                data={filteredCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={filteredCategories.length === 0 ? styles.emptyList : styles.list}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            />

            {/* Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('CategoryForm')}
            >
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
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
    filterContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
    },
    list: {
        padding: 15,
    },
    emptyList: {
        flex: 1,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    categoryType: {
        fontSize: 12,
        color: '#999',
    },
    chevron: {
        fontSize: 24,
        color: '#ccc',
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    addButtonText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
});

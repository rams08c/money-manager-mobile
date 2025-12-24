import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { categoriesAPI } from '../api/categories';
import { Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';

export function CategoriesScreen({ navigation }: any) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

    useEffect(() => {
        fetchCategories();
    }, [selectedType]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesAPI.getCategories(selectedType);
            setCategories(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category: Category) => {
        if (category.isSystem) {
            // System categories are read-only
            return;
        }

        // Show action sheet for user categories
        Alert.alert(
            category.name,
            'Choose an action',
            [
                {
                    text: 'Edit',
                    onPress: () => navigation.navigate('CategoryForm', { category }),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(category),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleDelete = async (category: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"?\n\nThis action cannot be undone.`,
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
                            Alert.alert('Delete Failed', getErrorMessage(error));
                        }
                    },
                },
            ]
        );
    };

    const systemCategories = categories.filter(c => c.isSystem);
    const userCategories = categories.filter(c => !c.isSystem);

    const renderCategory = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                item.isSystem && styles.systemCategoryItem,
            ]}
            onPress={() => handleCategoryPress(item)}
            disabled={item.isSystem}
        >
            <View style={styles.categoryContent}>
                <Text style={[
                    styles.categoryName,
                    item.isSystem && styles.systemCategoryName,
                ]}>
                    {item.name}
                </Text>
                {item.isSystem && (
                    <View style={styles.systemBadge}>
                        <Text style={styles.systemBadgeText}>SYSTEM</Text>
                    </View>
                )}
            </View>
            {!item.isSystem && (
                <Text style={styles.menuIcon}>⋮</Text>
            )}
        </TouchableOpacity>
    );

    const renderSectionHeader = (title: string) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
    );

    const renderEmptyUserCategories = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No custom categories</Text>
            <Text style={styles.emptyHint}>Tap "+ Add Category" below</Text>
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

    return (
        <View style={styles.container}>
            {/* Type Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedType === 'INCOME' && styles.tabActive]}
                    onPress={() => setSelectedType('INCOME')}
                >
                    <Text style={[styles.tabText, selectedType === 'INCOME' && styles.tabTextActive]}>
                        INCOME
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedType === 'EXPENSE' && styles.tabActive]}
                    onPress={() => setSelectedType('EXPENSE')}
                >
                    <Text style={[styles.tabText, selectedType === 'EXPENSE' && styles.tabTextActive]}>
                        EXPENSE
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Categories List */}
            <FlatList
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={
                    <>
                        {/* System Categories */}
                        {renderSectionHeader('SYSTEM CATEGORIES')}
                        {systemCategories.map(category => (
                            <View key={category.id}>
                                {renderCategory({ item: category })}
                            </View>
                        ))}

                        {/* User Categories */}
                        {renderSectionHeader('MY CATEGORIES')}
                        {userCategories.length === 0 ? (
                            renderEmptyUserCategories()
                        ) : (
                            userCategories.map(category => (
                                <View key={category.id}>
                                    {renderCategory({ item: category })}
                                </View>
                            ))
                        )}
                    </>
                }
                contentContainerStyle={styles.listContent}
            />

            {/* Sticky Add Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CategoryForm', { type: selectedType })}
                >
                    <Text style={styles.addButtonText}>+ Add Category</Text>
                </TouchableOpacity>
            </View>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#4F46E5', // Indigo-600
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B', // Slate-500
    },
    tabTextActive: {
        color: '#4F46E5', // Indigo-600
    },
    listContent: {
        paddingBottom: 100,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B', // Slate-500
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    systemCategoryItem: {
        backgroundColor: '#F9F9F9',
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryName: {
        fontSize: 17,
        color: '#0F172A', // Slate-900
        fontWeight: '600',
    },
    systemCategoryName: {
        color: '#666',
        fontWeight: '400',
    },
    systemBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: '#E5E5EA',
        borderRadius: 4,
    },
    systemBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8E8E93',
        letterSpacing: 0.5,
    },
    menuIcon: {
        fontSize: 20,
        color: '#C7C7CC',
        fontWeight: '300',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 4,
    },
    emptyHint: {
        fontSize: 14,
        color: '#C7C7CC',
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        padding: 16,
    },
    addButton: {
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
    },
});

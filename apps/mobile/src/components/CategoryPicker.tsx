import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { categoriesAPI } from '../api/categories';
import { Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface CategoryPickerProps {
    type: 'INCOME' | 'EXPENSE';
    selectedId?: string;
    onSelect: (category: Category) => void;
    editable?: boolean;
}

export function CategoryPicker({ type, selectedId, onSelect, editable = true }: CategoryPickerProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [type]);

    useEffect(() => {
        if (selectedId && categories.length > 0) {
            const category = categories.find(c => c.id === selectedId);
            setSelectedCategory(category || null);
        }
    }, [selectedId, categories]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesAPI.getCategories(type);
            setCategories(data);
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (category: Category) => {
        if (!editable) return;
        setSelectedCategory(category);
        onSelect(category);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
        );
    }

    if (categories.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No {type.toLowerCase()} categories available</Text>
                <Text style={styles.emptyHint}>Create categories first</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {categories.map((category) => (
                <TouchableOpacity
                    key={category.id}
                    style={[
                        styles.option,
                        selectedCategory?.id === category.id && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(category)}
                    disabled={!editable}
                >
                    <Text
                        style={[
                            styles.optionText,
                            selectedCategory?.id === category.id && styles.optionTextSelected,
                        ]}
                    >
                        {category.name}
                    </Text>
                    {selectedCategory?.id === category.id && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        padding: 16,
        backgroundColor: '#fff9e6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffe066',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    emptyHint: {
        fontSize: 12,
        color: '#999',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    optionSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

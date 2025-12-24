import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import { categoriesAPI } from '../api/categories';
import { Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface CategorySelectorProps {
    type: 'INCOME' | 'EXPENSE';
    selectedId?: string;
    onSelect: (category: Category) => void;
    editable?: boolean;
}

export function CategorySelector({ type, selectedId, onSelect, editable = true }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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
        setModalVisible(false);
    };

    if (loading) {
        return (
            <TouchableOpacity style={styles.selector} disabled>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.selectorText}>Loading...</Text>
            </TouchableOpacity>
        );
    }

    return (
        <>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => editable && setModalVisible(true)}
                disabled={!editable}
            >
                <Text style={[styles.selectorText, !selectedCategory && styles.placeholder]}>
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                </Text>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {categories.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No categories available</Text>
                                <Text style={styles.emptyHint}>Create categories first</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalOption,
                                            selectedCategory?.id === item.id && styles.modalOptionSelected,
                                        ]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.modalOptionText}>{item.name}</Text>
                                        {selectedCategory?.id === item.id && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
        minHeight: 48,
    },
    selectorText: {
        fontSize: 17,
        color: '#000',
    },
    placeholder: {
        color: '#8E8E93',
    },
    chevron: {
        fontSize: 24,
        color: '#C7C7CC',
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    modalClose: {
        fontSize: 24,
        color: '#8E8E93',
        fontWeight: '300',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    modalOptionSelected: {
        backgroundColor: '#F2F2F7',
    },
    modalOptionText: {
        fontSize: 17,
        color: '#000',
    },
    checkmark: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '600',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    emptyHint: {
        fontSize: 14,
        color: '#999',
    },
});

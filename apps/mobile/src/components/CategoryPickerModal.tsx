import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import { categoriesAPI } from '../api/categories';
import { Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface CategoryPickerModalProps {
    visible: boolean;
    type: 'INCOME' | 'EXPENSE';
    selectedId?: string;
    onSelect: (category: Category) => void;
    onClose: () => void;
}

export function CategoryPickerModal({ visible, type, selectedId, onSelect, onClose }: CategoryPickerModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchCategories();
        }
    }, [visible, type]);

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
        onSelect(category);
        onClose();
    };

    const renderCategory = ({ item }: { item: Category }) => {
        const isSelected = item.id === selectedId;

        return (
            <TouchableOpacity
                style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                onPress={() => handleSelect(item)}
            >
                <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {item.name}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Category</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Loading categories...</Text>
                        </View>
                    ) : categories.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No {type.toLowerCase()} categories available</Text>
                            <Text style={styles.emptyHint}>Create categories first</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={true}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#8E8E93',
        fontWeight: '300',
    },
    listContent: {
        padding: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        marginBottom: 8,
    },
    categoryItemSelected: {
        backgroundColor: '#E3F2FD',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#007AFF',
    },
    categoryText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    categoryTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
        marginBottom: 8,
    },
    emptyHint: {
        fontSize: 14,
        color: '#999',
    },
});

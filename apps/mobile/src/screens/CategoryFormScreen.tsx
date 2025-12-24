import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { categoriesAPI } from '../api/categories';
import { Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface CategoryFormScreenProps {
    navigation: any;
    route: any;
}

export function CategoryFormScreen({ navigation, route }: CategoryFormScreenProps) {
    const category: Category | undefined = route.params?.category;
    const isEditMode = !!category;

    const [name, setName] = useState(category?.name || '');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>(category?.type || 'EXPENSE');
    const [saving, setSaving] = useState(false);

    const validateForm = (): string | null => {
        if (!name.trim()) {
            return 'Category name is required';
        }
        if (name.trim().length < 1 || name.trim().length > 50) {
            return 'Category name must be between 1 and 50 characters';
        }
        return null;
    };

    const handleSave = async () => {
        const error = validateForm();
        if (error) {
            Alert.alert('Validation Error', error);
            return;
        }

        try {
            setSaving(true);

            if (isEditMode) {
                // Edit mode - only update name
                await categoriesAPI.updateCategory(category.id, { name: name.trim() });
                Alert.alert('Success', 'Category updated successfully');
            } else {
                // Create mode
                await categoriesAPI.createCategory({
                    name: name.trim(),
                    type,
                });
                Alert.alert('Success', 'Category created successfully');
            }

            navigation.goBack();
        } catch (error) {
            const message = getErrorMessage(error);
            if (message.includes('duplicate') || message.includes('already exists')) {
                Alert.alert('Duplicate Category', 'A category with this name already exists.');
            } else {
                Alert.alert(isEditMode ? 'Update Failed' : 'Create Failed', message);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;

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
                            setSaving(true);
                            await categoriesAPI.deleteCategory(category.id);
                            Alert.alert('Success', 'Category deleted successfully');
                            navigation.goBack();
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
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    const getTypeColor = (categoryType: 'INCOME' | 'EXPENSE') => {
        return categoryType === 'INCOME' ? '#34C759' : '#FF3B30';
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Type Selector */}
                <View style={styles.field}>
                    <Text style={styles.label}>Type *</Text>
                    {isEditMode ? (
                        <View style={styles.readOnlyField}>
                            <Text style={[styles.readOnlyText, { color: getTypeColor(type) }]}>
                                {type}
                            </Text>
                            <Text style={styles.immutableHint}>Cannot be changed</Text>
                        </View>
                    ) : (
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.typeOption,
                                    type === 'INCOME' && styles.typeOptionSelected,
                                    type === 'INCOME' && { borderColor: '#34C759' },
                                ]}
                                onPress={() => setType('INCOME')}
                                disabled={saving}
                            >
                                <Text
                                    style={[
                                        styles.typeOptionText,
                                        type === 'INCOME' && styles.typeOptionTextSelected,
                                        type === 'INCOME' && { color: '#34C759' },
                                    ]}
                                >
                                    INCOME
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.typeOption,
                                    type === 'EXPENSE' && styles.typeOptionSelected,
                                    type === 'EXPENSE' && { borderColor: '#FF3B30' },
                                ]}
                                onPress={() => setType('EXPENSE')}
                                disabled={saving}
                            >
                                <Text
                                    style={[
                                        styles.typeOptionText,
                                        type === 'EXPENSE' && styles.typeOptionTextSelected,
                                        type === 'EXPENSE' && { color: '#FF3B30' },
                                    ]}
                                >
                                    EXPENSE
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Name Input */}
                <View style={styles.field}>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Groceries, Salary, Rent"
                        maxLength={50}
                        editable={!saving}
                    />
                    <Text style={styles.hint}>1-50 characters</Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.saveButton,
                        { backgroundColor: getTypeColor(type) },
                        saving && styles.buttonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isEditMode ? 'Save Changes' : 'Create Category'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Delete Button (Edit mode only) */}
                {isEditMode && (
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={handleDelete}
                        disabled={saving}
                    >
                        <Text style={styles.deleteButtonText}>Delete Category</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    form: {
        padding: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 10,
    },
    typeOption: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    typeOptionSelected: {
        backgroundColor: '#f9f9f9',
        borderWidth: 2,
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    typeOptionTextSelected: {
        fontWeight: '700',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    readOnlyField: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
    },
    readOnlyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    immutableHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    button: {
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { budgetsAPI } from '../api/budgets';
import { Budget, Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';
import { CategoryPickerModal } from '../components/CategoryPickerModal';
import { DatePicker } from '../components/DatePicker';
import { categoriesAPI } from '../api/categories';

interface BudgetFormScreenProps {
    navigation: any;
    route: any;
}

export function BudgetFormScreen({ navigation, route }: BudgetFormScreenProps) {
    const budget: Budget | undefined = route.params?.budget;
    const initialMonth: string = route.params?.month || getCurrentMonth();
    const isEditMode = !!budget;

    const [categoryId, setCategoryId] = useState(budget?.categoryId || '');
    const [selectedCategoryName, setSelectedCategoryName] = useState(budget?.category?.name || '');
    const [amount, setAmount] = useState(budget?.amount || '');
    const [month, setMonth] = useState(budget?.month || initialMonth);
    const [saving, setSaving] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Fetch category name if editing and we don't have it
    useEffect(() => {
        if (isEditMode && categoryId && !selectedCategoryName) {
            fetchCategoryName();
        }
    }, [categoryId, isEditMode]);

    const fetchCategoryName = async () => {
        try {
            const categories = await categoriesAPI.getCategories('EXPENSE');
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                setSelectedCategoryName(category.name);
            }
        } catch (error) {
            // Silent fail - name will show as ID if fetch fails
        }
    };

    const handleCategorySelect = (category: Category) => {
        setCategoryId(category.id);
        setSelectedCategoryName(category.name);
    };

    function getCurrentMonth(): string {
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${monthNum}`;
    }

    const validateForm = (): string | null => {
        if (!amount || parseFloat(amount) <= 0) {
            return 'Budget amount must be greater than zero';
        }
        if (!isEditMode && !categoryId) {
            return 'Please enter a category ID';
        }
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return 'Month must be in YYYY-MM format';
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
                // Edit mode - only update amount
                await budgetsAPI.updateBudget(budget.id, { amount });
                Alert.alert('Success', 'Budget updated successfully');
            } else {
                // Create mode
                await budgetsAPI.createBudget({
                    categoryId,
                    amount,
                    month,
                });
                Alert.alert('Success', 'Budget created successfully');
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert(isEditMode ? 'Update Failed' : 'Create Failed', getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode) return;

        Alert.alert(
            'Delete Budget',
            'Are you sure you want to delete this budget?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            await budgetsAPI.deleteBudget(budget.id);
                            Alert.alert('Success', 'Budget deleted successfully');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Delete Failed', getErrorMessage(error));
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Category */}
                <View style={styles.field}>
                    <Text style={styles.label}>Category *</Text>
                    {isEditMode ? (
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{selectedCategoryName || categoryId}</Text>
                            <Text style={styles.immutableHint}>Cannot be changed</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.pickerField}
                            onPress={() => setShowCategoryPicker(true)}
                            disabled={saving}
                        >
                            <Text style={[
                                styles.pickerText,
                                !selectedCategoryName && styles.pickerPlaceholder
                            ]}>
                                {selectedCategoryName || 'Select Category'}
                            </Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Month */}
                {isEditMode ? (
                    <View style={styles.field}>
                        <Text style={styles.label}>Month *</Text>
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>
                                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Text>
                            <Text style={styles.immutableHint}>Cannot be changed</Text>
                        </View>
                    </View>
                ) : (
                    <DatePicker
                        label="Month *"
                        value={month + '-01'}
                        onChange={(date) => setMonth(date.substring(0, 7))}
                        editable={!saving}
                        mode="month"
                    />
                )}

                {/* Amount */}
                <View style={styles.field}>
                    <Text style={styles.label}>Budget Amount *</Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        editable={!saving}
                    />
                    <Text style={styles.hint}>
                        You'll be notified when you exceed this budget (soft limit)
                    </Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isEditMode ? 'Save Changes' : 'Create Budget'}
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
                        <Text style={styles.deleteButtonText}>Delete Budget</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Picker Modal */}
            <CategoryPickerModal
                visible={showCategoryPicker}
                type="EXPENSE"
                selectedId={categoryId}
                onSelect={handleCategorySelect}
                onClose={() => setShowCategoryPicker(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate-50
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
        color: '#0F172A', // Slate-900
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#0F172A', // Slate-900
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
        color: '#666',
    },
    immutableHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    pickerField: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    pickerPlaceholder: {
        color: '#999',
    },
    chevron: {
        fontSize: 24,
        color: '#999',
        fontWeight: '300',
    },
    button: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#4F46E5', // Indigo-600
    },
    deleteButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F43F5E', // Rose-500
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
        color: '#F43F5E', // Rose-500
        fontSize: 16,
        fontWeight: '600',
    },
});

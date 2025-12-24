import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { transactionsAPI } from '../api/transactions';
import { accountsAPI } from '../api/accounts';
import { Account, Transaction, BudgetAlert, Category } from '../api/types';
import { getErrorMessage } from '../utils/errors';
import { CategorySelector } from '../components/CategorySelector';
import { AccountSelector } from '../components/AccountSelector';
import { BudgetAlertModal } from '../components/BudgetAlertModal';
import { DatePicker } from '../components/DatePicker';

interface TransactionFormScreenProps {
    navigation: any;
    route: any;
}

export function TransactionFormScreen({ navigation, route }: TransactionFormScreenProps) {
    const transaction: Transaction | undefined = route.params?.transaction;
    const transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER' = route.params?.type || transaction?.type || 'EXPENSE';
    const isEditMode = !!transaction;

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
    const [accountId, setAccountId] = useState(transaction?.accountId || '');
    // For TRANSFER transactions, extract toAccountId from linkedTransaction
    const [toAccountId, setToAccountId] = useState(
        transaction?.type === 'TRANSFER' && transaction?.linkedTransaction?.accountId
            ? transaction.linkedTransaction.accountId
            : ''
    );
    const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
    const [note, setNote] = useState(transaction?.note || '');
    const [transactionDate, setTransactionDate] = useState(
        transaction?.transactionDate ? new Date(transaction.transactionDate).toISOString().split('T')[0] :
            new Date().toISOString().split('T')[0]
    );
    const [saving, setSaving] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
    const [showAlertModal, setShowAlertModal] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoadingAccounts(true);
            const data = await accountsAPI.getAccounts();
            setAccounts(data);

            // Auto-select first account if creating new transaction
            if (!isEditMode && data.length > 0 && !accountId) {
                setAccountId(data[0].id);
            }
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoadingAccounts(false);
        }
    };

    const validateForm = (): string | null => {
        if (!amount || parseFloat(amount) <= 0) {
            return 'Amount must be greater than zero';
        }
        if (!accountId) {
            return 'Please select an account';
        }
        if (transactionType === 'TRANSFER') {
            if (!toAccountId) {
                return 'Please select destination account';
            }
            if (accountId === toAccountId) {
                return 'Cannot transfer to the same account';
            }
        } else {
            // INCOME or EXPENSE requires category
            if (!categoryId) {
                return 'Please select a category';
            }
        }
        if (!transactionDate) {
            return 'Please select a date';
        }
        return null;
    };

    const performSave = async () => {
        try {
            setSaving(true);

            let response;
            if (isEditMode) {
                // Edit mode
                response = await transactionsAPI.updateTransaction(transaction.id, {
                    amount: parseFloat(amount),
                    accountId,
                    categoryId: categoryId || undefined,
                    note: note || undefined,
                    transactionDate,
                });
            } else {
                // Create mode
                response = await transactionsAPI.createTransaction({
                    type: transactionType,
                    amount: parseFloat(amount),
                    accountId,
                    categoryId: transactionType !== 'TRANSFER' ? categoryId : undefined,
                    toAccountId: transactionType === 'TRANSFER' ? toAccountId : undefined,
                    note: note || undefined,
                    transactionDate,
                });
            }

            // Check for budget alerts
            if (response.budgetAlerts && response.budgetAlerts.length > 0) {
                setBudgetAlerts(response.budgetAlerts);
                setShowAlertModal(true);
            } else {
                // No alerts, show success and navigate back
                Alert.alert('Success', isEditMode ? 'Transaction updated successfully' : 'Transaction created successfully');
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert(isEditMode ? 'Update Failed' : 'Create Failed', getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleAlertClose = () => {
        setShowAlertModal(false);
        Alert.alert('Success', isEditMode ? 'Transaction updated successfully' : 'Transaction created successfully');
        navigation.goBack();
    };

    const handleSave = async () => {
        const error = validateForm();
        if (error) {
            Alert.alert('Validation Error', error);
            return;
        }

        // Show warning for transfer edits
        if (isEditMode && transaction.type === 'TRANSFER') {
            Alert.alert(
                'Edit Transfer',
                'Editing this transfer will update both the outgoing and incoming records.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: () => performSave() },
                ]
            );
        } else {
            await performSave();
        }
    };

    const handleDelete = async () => {
        if (!transaction) return;

        const confirmMessage = transaction.type === 'TRANSFER'
            ? 'This will delete both the outgoing and incoming transfer records. This action cannot be undone.'
            : 'Are you sure you want to delete this transaction? This action cannot be undone.';

        Alert.alert(
            'Delete Transaction',
            confirmMessage,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            await transactionsAPI.deleteTransaction(transaction.id);
                            Alert.alert('Success', 'Transaction deleted successfully');
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

    const getTypeLabel = () => {
        switch (transactionType) {
            case 'INCOME': return 'Income';
            case 'EXPENSE': return 'Expense';
            case 'TRANSFER': return 'Transfer';
            default: return 'Transaction';
        }
    };

    if (loadingAccounts) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Type Badge */}
                <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{getTypeLabel()}</Text>
                </View>

                {/* Amount */}
                <View style={styles.field}>
                    <Text style={styles.label}>Amount *</Text>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        editable={!saving}
                        autoFocus
                    />
                </View>

                {/* Account (From Account for Transfer) */}
                <View style={styles.field}>
                    <Text style={styles.label}>
                        {transactionType === 'TRANSFER' ? 'From Account *' : 'Account *'}
                    </Text>
                    <AccountSelector
                        accounts={accounts}
                        selectedId={accountId}
                        onSelect={setAccountId}
                        editable={!saving}
                        label={transactionType === 'TRANSFER' ? 'Select from account' : 'Select account'}
                    />
                </View>

                {/* To Account (Transfer only) */}
                {transactionType === 'TRANSFER' && (
                    <View style={styles.field}>
                        <Text style={styles.label}>To Account *</Text>
                        <AccountSelector
                            accounts={accounts}
                            selectedId={toAccountId}
                            onSelect={setToAccountId}
                            editable={!saving}
                            label="Select to account"
                            excludeId={accountId}
                        />
                    </View>
                )}

                {/* Category (Income/Expense only) */}
                {transactionType !== 'TRANSFER' && (
                    <View style={styles.field}>
                        <Text style={styles.label}>Category *</Text>
                        <CategorySelector
                            type={transactionType}
                            selectedId={categoryId}
                            onSelect={(category: Category) => setCategoryId(category.id)}
                            editable={!saving}
                        />
                    </View>
                )}

                {/* Date */}
                <DatePicker
                    label="Date *"
                    value={transactionDate}
                    onChange={setTransactionDate}
                    editable={!saving}
                    mode="date"
                />

                {/* Note */}
                <View style={styles.field}>
                    <Text style={styles.label}>Note (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Add a note..."
                        multiline={true}
                        numberOfLines={3}
                        editable={!saving}
                    />
                </View>

                {/* Delete Button (Edit Mode Only) */}
                {isEditMode && (
                    <TouchableOpacity
                        style={[styles.deleteButton, saving && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={saving}
                    >
                        <Text style={styles.deleteButtonText}>Delete Transaction</Text>
                    </TouchableOpacity>
                )}

                {/* Spacer for sticky button */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Sticky Save Button */}
            <View style={styles.stickyButtonContainer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {isEditMode ? 'Save Changes' : 'Save Transaction'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <BudgetAlertModal
                alerts={budgetAlerts}
                visible={showAlertModal}
                onClose={handleAlertClose}
            />
        </KeyboardAvoidingView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 24,
    },
    typeBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
    amountInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
        borderRadius: 12,
        padding: 16,
        fontSize: 28,
        fontWeight: '600',
        color: '#0F172A', // Slate-900
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
        borderRadius: 12,
        padding: 12,
        fontSize: 17,
        color: '#0F172A', // Slate-900
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F43F5E', // Rose-500
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    deleteButtonText: {
        color: '#F43F5E', // Rose-500
        fontSize: 16,
        fontWeight: '600',
    },
    stickyButtonContainer: {
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    },
    saveButton: {
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
    },
});

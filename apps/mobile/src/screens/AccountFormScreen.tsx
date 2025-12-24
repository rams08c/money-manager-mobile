import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { accountsAPI } from '../api/accounts';
import { Account } from '../api/types';
import { getErrorMessage } from '../utils/errors';
import { AccountTypePickerModal } from '../components/AccountTypePickerModal';
import { CurrencyPickerModal } from '../components/CurrencyPickerModal';

interface AccountFormScreenProps {
    navigation: any;
    route: any;
}

const ACCOUNT_TYPES = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Account', value: 'BANK' },
    { label: 'Digital Wallet', value: 'WALLET' },
    { label: 'Credit Card', value: 'CREDIT_CARD' },
];

export function AccountFormScreen({ navigation, route }: AccountFormScreenProps) {
    const account: Account | undefined = route.params?.account;
    const isEditMode = !!account;

    const [name, setName] = useState(account?.name || '');
    const [type, setType] = useState<'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD' | ''>(account?.type || '');
    const [currency, setCurrency] = useState(account?.currency || '');
    const [openingBalance, setOpeningBalance] = useState(account?.openingBalance || '');
    const [saving, setSaving] = useState(false);

    // Modal visibility state
    const [showAccountTypePicker, setShowAccountTypePicker] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

    // Get display label for account type
    const getAccountTypeLabel = (value: string): string => {
        const accountType = ACCOUNT_TYPES.find(t => t.value === value);
        return accountType?.label || '';
    };

    const validateForm = (): string | null => {
        if (!name.trim()) {
            return 'Account name is required';
        }
        if (!isEditMode && !type) {
            return 'Please select account type';
        }
        if (!isEditMode && !currency.trim()) {
            return 'Currency is required';
        }
        if (!isEditMode && currency.length !== 3) {
            return 'Currency must be 3-letter code (e.g., USD, EUR, INR)';
        }
        if (!isEditMode && openingBalance === '') {
            return 'Opening balance is required';
        }
        if (!isEditMode && isNaN(parseFloat(openingBalance))) {
            return 'Opening balance must be a valid number';
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
                await accountsAPI.updateAccount(account.id, { name });
                Alert.alert('Success', 'Account updated successfully');
            } else {
                // Create mode - all fields required
                await accountsAPI.createAccount({
                    name,
                    type: type as 'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD',
                    currency: currency.toUpperCase(),
                    openingBalance,
                });
                Alert.alert('Success', 'Account created successfully');
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert(isEditMode ? 'Update Failed' : 'Create Failed', getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>Account Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Main Wallet, HDFC Bank"
                        editable={!saving}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Account Type *</Text>
                    {isEditMode ? (
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>
                                {getAccountTypeLabel(type)}
                            </Text>
                            <Text style={styles.immutableHint}>Cannot be changed</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.pickerField}
                            onPress={() => setShowAccountTypePicker(true)}
                            disabled={saving}
                        >
                            <Text style={[
                                styles.pickerText,
                                !type && styles.pickerPlaceholder
                            ]}>
                                {type ? getAccountTypeLabel(type) : 'Select Account Type'}
                            </Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Currency *</Text>
                    {isEditMode ? (
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{currency}</Text>
                            <Text style={styles.immutableHint}>Cannot be changed</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.pickerField}
                            onPress={() => setShowCurrencyPicker(true)}
                            disabled={saving}
                        >
                            <Text style={[
                                styles.pickerText,
                                !currency && styles.pickerPlaceholder
                            ]}>
                                {currency || 'Select Currency'}
                            </Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Opening Balance *</Text>
                    {isEditMode ? (
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>
                                {currency} {openingBalance}
                            </Text>
                            <Text style={styles.immutableHint}>Cannot be changed</Text>
                        </View>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                value={openingBalance}
                                onChangeText={setOpeningBalance}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                editable={!saving}
                            />
                            <Text style={styles.hint}>Initial amount (can be negative for credit cards)</Text>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.button, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isEditMode ? 'Save Changes' : 'Create Account'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Account Type Picker Modal */}
            <AccountTypePickerModal
                visible={showAccountTypePicker}
                selectedValue={type}
                onSelect={(value) => setType(value)}
                onClose={() => setShowAccountTypePicker(false)}
            />

            {/* Currency Picker Modal */}
            <CurrencyPickerModal
                visible={showCurrencyPicker}
                selectedCode={currency}
                onSelect={(code) => setCurrency(code)}
                onClose={() => setShowCurrencyPicker(false)}
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
        fontSize: 17,
        color: '#0F172A', // Slate-900
    },
    hint: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 4,
    },
    readOnlyField: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
    },
    readOnlyText: {
        fontSize: 17,
        color: '#8E8E93',
    },
    immutableHint: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 4,
        fontStyle: 'italic',
    },
    pickerField: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 17,
        color: '#000',
    },
    pickerPlaceholder: {
        color: '#8E8E93',
    },
    chevron: {
        fontSize: 24,
        color: '#8E8E93',
        fontWeight: '300',
    },
    button: {
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
    },
});


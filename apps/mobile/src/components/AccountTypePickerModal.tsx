import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';

interface AccountType {
    label: string;
    value: 'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD';
}

interface AccountTypePickerModalProps {
    visible: boolean;
    selectedValue?: string;
    onSelect: (value: 'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD') => void;
    onClose: () => void;
}

const ACCOUNT_TYPES: AccountType[] = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Account', value: 'BANK' },
    { label: 'Digital Wallet', value: 'WALLET' },
    { label: 'Credit Card', value: 'CREDIT_CARD' },
];

export function AccountTypePickerModal({ visible, selectedValue, onSelect, onClose }: AccountTypePickerModalProps) {
    const handleSelect = (value: 'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD') => {
        onSelect(value);
        onClose();
    };

    const renderAccountType = ({ item }: { item: AccountType }) => {
        const isSelected = item.value === selectedValue;

        return (
            <TouchableOpacity
                style={[styles.typeItem, isSelected && styles.typeItemSelected]}
                onPress={() => handleSelect(item.value)}
            >
                <View style={styles.radioButton}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                    {item.label}
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
                        <Text style={styles.title}>Select Account Type</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <FlatList
                        data={ACCOUNT_TYPES}
                        renderItem={renderAccountType}
                        keyExtractor={(item) => item.value}
                        contentContainerStyle={styles.listContent}
                    />
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
        maxHeight: '50%',
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
    typeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        marginBottom: 8,
    },
    typeItemSelected: {
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
    typeText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    typeTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: 'bold',
    },
});

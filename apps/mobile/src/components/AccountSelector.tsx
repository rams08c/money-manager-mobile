import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Account } from '../api/types';

interface AccountSelectorProps {
    accounts: Account[];
    selectedId?: string;
    onSelect: (accountId: string) => void;
    editable?: boolean;
    label?: string;
    excludeId?: string; // For transfer "To Account" to exclude selected "From Account"
}

export function AccountSelector({
    accounts,
    selectedId,
    onSelect,
    editable = true,
    label = 'Select account',
    excludeId,
}: AccountSelectorProps) {
    const [modalVisible, setModalVisible] = React.useState(false);

    const filteredAccounts = excludeId
        ? accounts.filter(acc => acc.id !== excludeId)
        : accounts;

    const selectedAccount = accounts.find(acc => acc.id === selectedId);

    const handleSelect = (accountId: string) => {
        onSelect(accountId);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => editable && setModalVisible(true)}
                disabled={!editable}
            >
                <Text style={[styles.selectorText, !selectedAccount && styles.placeholder]}>
                    {selectedAccount ? `${selectedAccount.name} (${selectedAccount.currency})` : label}
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
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {filteredAccounts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No accounts available</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredAccounts}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalOption,
                                            selectedId === item.id && styles.modalOptionSelected,
                                        ]}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <View>
                                            <Text style={styles.modalOptionText}>{item.name}</Text>
                                            <Text style={styles.modalOptionSubtext}>
                                                {item.currency} • Balance: {item.balance}
                                            </Text>
                                        </View>
                                        {selectedId === item.id && (
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
        marginBottom: 4,
    },
    modalOptionSubtext: {
        fontSize: 14,
        color: '#8E8E93',
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
    },
});

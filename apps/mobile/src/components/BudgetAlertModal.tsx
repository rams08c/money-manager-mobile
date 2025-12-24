import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BudgetAlert } from '../api/types';

interface BudgetAlertModalProps {
    alerts: BudgetAlert[];
    visible: boolean;
    onClose: () => void;
}

export function BudgetAlertModal({ alerts, visible, onClose }: BudgetAlertModalProps) {
    if (alerts.length === 0) return null;

    const getAlertIcon = (threshold: 80 | 100 | 'over') => {
        if (threshold === 'over') return '🚨';
        if (threshold === 100) return '⚠️';
        return '⚠️';
    };

    const getAlertColor = (threshold: 80 | 100 | 'over') => {
        if (threshold === 'over') return '#FF3B30';
        if (threshold === 100) return '#FF9500';
        return '#FF9500';
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Budget Alert</Text>

                    <ScrollView style={styles.alertsContainer}>
                        {alerts.map((alert, index) => {
                            const color = getAlertColor(alert.threshold);
                            const icon = getAlertIcon(alert.threshold);

                            return (
                                <View key={index} style={styles.alertItem}>
                                    <Text style={styles.icon}>{icon}</Text>
                                    <View style={styles.content}>
                                        <Text style={styles.category}>{alert.categoryName}</Text>
                                        <Text style={styles.message}>{alert.message}</Text>
                                        <Text style={styles.details}>
                                            ${alert.actualAmount.toFixed(2)} of ${alert.budgetAmount.toFixed(2)}
                                            ({alert.percentageUsed.toFixed(0)}%)
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    alertsContainer: {
        maxHeight: 300,
    },
    alertItem: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 12,
    },
    icon: {
        fontSize: 24,
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    details: {
        fontSize: 13,
        color: '#999',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

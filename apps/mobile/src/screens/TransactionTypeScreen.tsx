import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TransactionTypeScreenProps {
    navigation: any;
}

export function TransactionTypeScreen({ navigation }: TransactionTypeScreenProps) {
    const handleTypeSelect = (type: 'INCOME' | 'EXPENSE' | 'TRANSFER') => {
        navigation.navigate('TransactionForm', { type });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Transaction Type</Text>

            <TouchableOpacity
                style={[styles.typeButton, styles.incomeButton]}
                onPress={() => handleTypeSelect('INCOME')}
            >
                <Text style={styles.typeIcon}>↓</Text>
                <Text style={styles.typeLabel}>INCOME</Text>
                <Text style={styles.typeDescription}>Money In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.typeButton, styles.expenseButton]}
                onPress={() => handleTypeSelect('EXPENSE')}
            >
                <Text style={styles.typeIcon}>↑</Text>
                <Text style={styles.typeLabel}>EXPENSE</Text>
                <Text style={styles.typeDescription}>Money Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.typeButton, styles.transferButton]}
                onPress={() => handleTypeSelect('TRANSFER')}
            >
                <Text style={styles.typeIcon}>⇄</Text>
                <Text style={styles.typeLabel}>TRANSFER</Text>
                <Text style={styles.typeDescription}>Move Money</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    title: {
        fontSize: 24,
        fontWeight: '700', // Bold
        color: '#0F172A', // Slate-900
        marginBottom: 30,
        textAlign: 'center',
    },
    typeButton: {
        borderRadius: 24,
        padding: 32,
        marginBottom: 16,
        alignItems: 'center',
    },
    incomeButton: {
        backgroundColor: '#10B981', // Emerald-500
    },
    expenseButton: {
        backgroundColor: '#F43F5E', // Rose-500
    },
    transferButton: {
        backgroundColor: '#4F46E5', // Indigo-600
    },
    typeIcon: {
        fontSize: 48,
        color: '#fff',
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    typeDescription: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
});

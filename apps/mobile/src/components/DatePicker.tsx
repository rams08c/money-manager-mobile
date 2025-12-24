import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DatePickerProps {
    label: string;
    value: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    editable?: boolean;
    mode?: 'date' | 'month';
}

export function DatePicker({ label, value, onChange, editable = true, mode = 'date' }: DatePickerProps) {
    const [showModal, setShowModal] = useState(false);

    const formatDisplayDate = (dateString: string): string => {
        if (!dateString) return 'Select date';

        if (mode === 'month') {
            // Format: December 2025
            const [year, month] = dateString.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else {
            // Format: Dec 22, 2025
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const handleDayPress = (day: any) => {
        if (mode === 'month') {
            // Extract YYYY-MM from selected date
            const selectedMonth = day.dateString.substring(0, 7);
            onChange(selectedMonth + '-01');
        } else {
            onChange(day.dateString);
        }
        setShowModal(false);
    };

    const handlePress = () => {
        if (editable) {
            setShowModal(true);
        }
    };

    // Get marked dates for calendar
    const getMarkedDates = () => {
        if (!value) return {};

        const dateToMark = mode === 'month' ? value.substring(0, 7) + '-01' : value;
        return {
            [dateToMark]: {
                selected: true,
                selectedColor: '#007AFF',
            },
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.input, !editable && styles.inputDisabled]}
                onPress={handlePress}
                disabled={!editable}
            >
                <Text style={[styles.inputText, !value && styles.placeholder]}>
                    {value ? formatDisplayDate(value) : 'Select date'}
                </Text>
                <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {mode === 'month' ? 'Select Month' : 'Select Date'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Calendar
                            current={value || new Date().toISOString().split('T')[0]}
                            onDayPress={handleDayPress}
                            markedDates={getMarkedDates()}
                            theme={{
                                backgroundColor: '#FFF',
                                calendarBackground: '#FFF',
                                textSectionTitleColor: '#8E8E93',
                                selectedDayBackgroundColor: '#007AFF',
                                selectedDayTextColor: '#FFF',
                                todayTextColor: '#007AFF',
                                dayTextColor: '#000',
                                textDisabledColor: '#E5E5EA',
                                monthTextColor: '#000',
                                textMonthFontWeight: '600',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                            }}
                            enableSwipeMonths={true}
                            hideExtraDays={true}
                        />

                        <TouchableOpacity
                            style={styles.todayButton}
                            onPress={() => {
                                const today = new Date().toISOString().split('T')[0];
                                if (mode === 'month') {
                                    onChange(today.substring(0, 7) + '-01');
                                } else {
                                    onChange(today);
                                }
                                setShowModal(false);
                            }}
                        >
                            <Text style={styles.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputDisabled: {
        backgroundColor: '#F9F9F9',
    },
    inputText: {
        fontSize: 17,
        color: '#000',
    },
    placeholder: {
        color: '#8E8E93',
    },
    icon: {
        fontSize: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
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
    closeButton: {
        fontSize: 24,
        color: '#8E8E93',
        paddingHorizontal: 8,
    },
    todayButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        margin: 16,
        alignItems: 'center',
    },
    todayButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
    },
});

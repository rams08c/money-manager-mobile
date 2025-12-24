import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface AppHeaderProps {
    navigation?: any;
}

export function AppHeader({ navigation }: AppHeaderProps) {
    const { state, logout } = useAuth();
    const [settingsVisible, setSettingsVisible] = useState(false);

    const userName = state.user?.name || state.user?.email?.split('@')[0] || 'User';

    const handleProfilePress = () => {
        setSettingsVisible(false);
        navigation?.navigate('Profile');
    };

    const handleLogout = async () => {
        setSettingsVisible(false);
        await logout();
    };

    return (
        <>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {userName}</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setSettingsVisible(true)}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Settings Bottom Sheet */}
            <Modal
                visible={settingsVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSettingsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSettingsVisible(false)}
                >
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />

                        <Text style={styles.sheetTitle}>Settings</Text>

                        <TouchableOpacity
                            style={styles.sheetOption}
                            onPress={handleProfilePress}
                        >
                            <Text style={styles.optionIcon}>👤</Text>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Profile</Text>
                                <Text style={styles.optionSubtitle}>Edit name, email, currency</Text>
                            </View>
                            <Text style={styles.optionChevron}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sheetOption, styles.logoutOption]}
                            onPress={handleLogout}
                        >
                            <Text style={styles.optionIcon}>🚪</Text>
                            <View style={styles.optionContent}>
                                <Text style={[styles.optionTitle, styles.logoutText]}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700', // Bold
        color: '#0F172A', // Slate-900
    },
    settingsButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsIcon: {
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#CBD5E1', // Slate-300
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A', // Slate-900
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9', // Slate-100
    },
    logoutOption: {
        borderBottomWidth: 0,
    },
    optionIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A', // Slate-900
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#64748B', // Slate-500
    },
    optionChevron: {
        fontSize: 24,
        color: '#CBD5E1', // Slate-300
        fontWeight: '300',
    },
    logoutText: {
        color: '#F43F5E', // Rose-500
    },
});

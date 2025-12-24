import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { userAPI } from '../api/users';
import { User } from '../api/types';
import { getErrorMessage } from '../utils/errors';

interface ProfileScreenProps {
    navigation: any;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const profile = await userAPI.getProfile();
            setUser(profile);
            setName(profile.name || '');
            setEmail(profile.email);
            setCurrency(profile.defaultCurrency || '');
        } catch (error) {
            Alert.alert('Error', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!email) {
            Alert.alert('Error', 'Email is required');
            return;
        }

        try {
            setSaving(true);
            const updated = await userAPI.updateProfile({
                name: name || undefined,
                email,
                defaultCurrency: currency || undefined,
            });
            setUser(updated);
            setEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Update Failed', getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset to original values
        if (user) {
            setName(user.name || '');
            setEmail(user.email);
            setCurrency(user.defaultCurrency || '');
        }
        setEditing(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>Name</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            editable={!saving}
                        />
                    ) : (
                        <Text style={styles.value}>{user.name || 'Not set'}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!saving}
                        />
                    ) : (
                        <Text style={styles.value}>{user.email}</Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Default Currency</Text>
                    {editing ? (
                        <TextInput
                            style={styles.input}
                            value={currency}
                            onChangeText={(text) => setCurrency(text.toUpperCase())}
                            placeholder="USD"
                            maxLength={3}
                            autoCapitalize="characters"
                            editable={!saving}
                        />
                    ) : (
                        <Text style={styles.value}>{user.defaultCurrency || 'Not set'}</Text>
                    )}
                    {editing && (
                        <Text style={styles.hint}>
                            3-letter ISO code (e.g., USD, EUR, INR)
                        </Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Member Since</Text>
                    <Text style={styles.value}>
                        {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                {editing ? (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            disabled={saving}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.editButton]}
                        onPress={() => setEditing(true)}
                    >
                        <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC', // Slate-50
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#64748B', // Slate-500
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#4F46E5', // Indigo-600
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 16,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4F46E5', // Indigo-600
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    form: {
        backgroundColor: '#fff',
        marginTop: 20,
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
    value: {
        fontSize: 16,
        color: '#64748B', // Slate-500
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
    actions: {
        padding: 20,
    },
    button: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#4F46E5', // Indigo-600
    },
    saveButton: {
        backgroundColor: '#10B981', // Emerald-500
    },
    cancelButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#0F172A', // Slate-900
        fontSize: 16,
        fontWeight: '600',
    },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errors';

interface LoginScreenProps {
    navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            // Navigation handled by RootNavigator based on auth state
        } catch (error) {
            Alert.alert('Login Failed', getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
            >
                <Text style={styles.linkText}>
                    Don't have an account? <Text style={styles.linkTextBold}>Register</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    title: {
        fontSize: 32,
        fontWeight: '700', // Bold
        textAlign: 'center',
        marginBottom: 8,
        color: '#0F172A', // Slate-900
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#64748B', // Slate-500
    },
    input: {
        backgroundColor: '#FFFFFF', // White
        borderWidth: 1,
        borderColor: '#E2E8F0', // Slate-200
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#0F172A', // Slate-900
    },
    button: {
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: 16, // Button radius
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600', // Semibold
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#64748B', // Slate-500
        fontSize: 14,
    },
    linkTextBold: {
        color: '#4F46E5', // Indigo-600
        fontWeight: '600',
    },
});

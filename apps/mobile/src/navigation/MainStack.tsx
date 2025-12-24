import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AccountsListScreen } from '../screens/AccountsListScreen';
import { AccountFormScreen } from '../screens/AccountFormScreen';
import { TransactionsListScreen } from '../screens/TransactionsListScreen';
import { TransactionTypeScreen } from '../screens/TransactionTypeScreen';
import { TransactionFormScreen } from '../screens/TransactionFormScreen';
import { BudgetsListScreen } from '../screens/BudgetsListScreen';
import { BudgetFormScreen } from '../screens/BudgetFormScreen';
import { MonthlySummaryScreen } from '../screens/MonthlySummaryScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryFormScreen } from '../screens/CategoryFormScreen';
import { BudgetVsActualScreen } from '../screens/BudgetVsActualScreen';

const Stack = createNativeStackNavigator();

/**
 * Main stack - screens for authenticated users
 */
export function MainStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Money Manager' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
            <Stack.Screen
                name="Accounts"
                component={AccountsListScreen}
                options={({ navigation }: any) => ({
                    title: 'Accounts',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AccountForm')}
                            style={{
                                width: 44,
                                height: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 8
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={{ fontSize: 30, fontWeight: '300', color: '#007AFF', lineHeight: 30 }}>⊕</Text>
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="AccountForm"
                component={AccountFormScreen}
                options={({ route }: any) => ({
                    title: route.params?.account ? 'Edit Account' : 'New Account'
                })}
            />
            <Stack.Screen
                name="Transactions"
                component={TransactionsListScreen}
                options={({ navigation }: any) => ({
                    title: 'Transactions',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('TransactionType')}
                            style={{
                                width: 44,
                                height: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 8
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={{ fontSize: 30, fontWeight: '300', color: '#007AFF', lineHeight: 30 }}>⊕</Text>
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="TransactionType"
                component={TransactionTypeScreen}
                options={{ title: 'New Transaction' }}
            />
            <Stack.Screen
                name="TransactionForm"
                component={TransactionFormScreen}
                options={({ route }: any) => {
                    if (route.params?.transaction) {
                        return { title: 'Edit Transaction' };
                    }
                    const type = route.params?.type;
                    return {
                        title: type === 'INCOME' ? 'New Income' :
                            type === 'EXPENSE' ? 'New Expense' :
                                type === 'TRANSFER' ? 'New Transfer' :
                                    'New Transaction'
                    };
                }}
            />
            <Stack.Screen
                name="Budgets"
                component={BudgetsListScreen}
                options={({ navigation }: any) => ({
                    title: 'Budgets',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BudgetForm')}
                            style={{
                                width: 44,
                                height: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 8
                            }}
                            activeOpacity={0.6}
                        >
                            <Text style={{ fontSize: 30, fontWeight: '300', color: '#007AFF', lineHeight: 30 }}>⊕</Text>
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="BudgetForm"
                component={BudgetFormScreen}
                options={({ route }: any) => ({
                    title: route.params?.budget ? 'Edit Budget' : 'New Budget'
                })}
            />
            <Stack.Screen
                name="Reports"
                component={MonthlySummaryScreen}
                options={{ title: 'Monthly Report' }}
            />
            <Stack.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{ title: 'Categories' }}
            />
            <Stack.Screen
                name="CategoryForm"
                component={CategoryFormScreen}
                options={({ route }: any) => ({
                    title: route.params?.category ? 'Edit Category' : 'New Category'
                })}
            />
            <Stack.Screen
                name="BudgetVsActual"
                component={BudgetVsActualScreen}
                options={{ title: 'Budget vs Actual' }}
            />
            {/* Add more authenticated screens here */}
        </Stack.Navigator>
    );
}

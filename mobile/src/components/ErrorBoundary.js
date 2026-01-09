import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.title}>Something went wrong 😢</Text>
                        <Text style={styles.subtitle}>
                            Please show this screen to the developer.
                        </Text>
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {this.state.error && this.state.error.toString()}
                            </Text>
                            {this.state.errorInfo && (
                                <Text style={styles.stackTrace}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => this.setState({ hasError: false })}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        paddingTop: 50,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
    },
    errorBox: {
        backgroundColor: '#ffebee',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffcdd2',
        marginBottom: 20,
    },
    errorText: {
        fontSize: 14,
        color: '#c62828',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    stackTrace: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#d32f2f',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ErrorBoundary;

import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius } from '../constants/theme';
import api from '../services/api';

const ImageUpload = ({ onImageUploaded, initialImage, label = 'Upload Image', width = 150, height = 150, borderRadius = 12 }) => {
    const [image, setImage] = useState(initialImage);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        console.log('pickImage called');
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission status:', status);

            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }

            console.log('Launching image library...');
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            console.log('Image picker result:', result);

            if (!result.canceled) {
                handleUpload(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to open image picker');
        }
    };

    const handleUpload = async (asset) => {
        setUploading(true);
        try {
            const formData = new FormData();

            // Append file
            const localUri = asset.uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', { uri: localUri, name: filename, type });

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageUrl = response.data.url;
            setImage(imageUrl);
            if (onImageUploaded) {
                onImageUploaded(imageUrl);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={pickImage}
                style={[styles.uploadButton, { width, height, borderRadius }]}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color={colors.primary} />
                ) : image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.icon}>📷</Text>
                        <Text style={styles.label}>{label}</Text>
                    </View>
                )}
            </TouchableOpacity>
            {image && !uploading && (
                <TouchableOpacity onPress={() => setImage(null)} style={styles.removeButton}>
                    <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    uploadButton: {
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 32,
        marginBottom: spacing.xs,
        color: colors.textSecondary,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    removeButton: {
        marginTop: spacing.sm,
    },
    removeText: {
        color: colors.error,
        fontSize: 14,
    },
});

export default ImageUpload;

import React from 'react';
import { Box, Text, Button, ButtonText, Center, VStack } from '@gluestack-ui/themed';

const EmptyState = ({ icon, title, message, actionText, onAction }) => {
    return (
        <Center flex={1} p="$8">
            <VStack space="md" alignItems="center">
                <Box mb="$4">
                    {/* Handle both emoji strings and Icon components */}
                    {typeof icon === 'string' ? (
                        <Text size="4xl">{icon}</Text>
                    ) : (
                        icon
                    )}
                </Box>
                <Text size="xl" fontWeight="$bold" color="$textLight" textAlign="center">
                    {title}
                </Text>
                <Text color="$textDim" textAlign="center" mb="$4">
                    {message}
                </Text>
                {actionText && onAction && (
                    <Button action="primary" variant="outline" onPress={onAction} borderColor="$primary500">
                        <ButtonText color="$primary500" fontWeight="$bold">{actionText}</ButtonText>
                    </Button>
                )}
            </VStack>
        </Center>
    );
};

export default EmptyState;

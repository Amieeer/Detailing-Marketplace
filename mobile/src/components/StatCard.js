import React from 'react';
import { Box, Text, VStack, HStack } from '@gluestack-ui/themed';

const StatCard = ({ icon, value, label, color }) => {
    return (
        <Box
            bg="$backgroundCard"
            p="$4"
            rounded="$xl"
            flex={1}
            borderWidth={1}
            borderColor="$secondary900"
            hardShadow="1"
        >
            <VStack space="xs">
                <HStack justifyContent="space-between" alignItems="center" mb="$1">
                    {/* Render icon directly if it's a component, or wrap in Text if string */}
                    {typeof icon === 'string' ? <Text size="2xl">{icon}</Text> : icon}

                    <Text
                        size="2xl"
                        fontWeight="$bold"
                        color={color || "$textLight"}
                    >
                        {value}
                    </Text>
                </HStack>
                <Text color="$textDim" size="xs" fontWeight="$medium">{label}</Text>
            </VStack>
        </Box>
    );
};

export default StatCard;

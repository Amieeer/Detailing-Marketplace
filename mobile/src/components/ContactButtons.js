import React from 'react';
import { Button, ButtonText, ButtonIcon, HStack } from '@gluestack-ui/themed';
import { PhoneIcon, MessageSquareIcon } from 'lucide-react-native';

const ContactButtons = ({ detailer, user, onCallPress, onMessagePress, mb }) => {
    return (
        <HStack space="md" mb={mb}>
            {detailer.phone_number && (
                <Button
                    flex={1}
                    action="primary"
                    variant="solid"
                    size="lg"
                    rounded="$full"
                    onPress={onCallPress}
                    bg="$primary500"
                    hardShadow="3"
                >
                    <ButtonIcon as={PhoneIcon} mr="$2" color="#000000" />
                    <ButtonText fontWeight="$bold" color="#000000">Call</ButtonText>
                </Button>
            )}
            {user?.id !== detailer.id && (
                <Button
                    flex={1}
                    action="secondary"
                    variant="solid"
                    size="lg"
                    rounded="$full"
                    bg="$secondary800"
                    hardShadow="3"
                    onPress={onMessagePress}
                >
                    <ButtonIcon as={MessageSquareIcon} mr="$2" color="$white" />
                    <ButtonText fontWeight="$bold" color="$white">Message</ButtonText>
                </Button>
            )}
        </HStack>
    );
};

export default ContactButtons;

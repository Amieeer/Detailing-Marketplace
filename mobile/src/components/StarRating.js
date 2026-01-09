import React from 'react';
import { Pressable } from 'react-native';
import { HStack, Icon } from '@gluestack-ui/themed';
import { StarIcon } from 'lucide-react-native';

const StarRating = ({ rating, onRatingChange, interactive = false, size = 20 }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <HStack space="xs" alignItems="center">
            {stars.map((index) => {
                const filled = index <= rating;
                const iconColor = filled ? "#FFD700" : "$secondary800"; // Gold or dark gray
                const iconFill = filled ? "#FFD700" : "none";

                if (interactive) {
                    return (
                        <Pressable
                            key={index}
                            onPress={() => onRatingChange(index)}
                            style={{ padding: 4 }}
                        >
                            <Icon
                                as={StarIcon}
                                size={size} // Gluestack size or number
                                color={iconColor}
                                fill={iconFill}
                            />
                        </Pressable>
                    );
                }

                return (
                    <Icon
                        key={index}
                        as={StarIcon}
                        size={size}
                        color={iconColor}
                        fill={iconFill}
                    />
                );
            })}
        </HStack>
    );
};

export default StarRating;

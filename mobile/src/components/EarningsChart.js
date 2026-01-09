import React from 'react';
import { Dimensions } from 'react-native';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const EarningsChart = ({ data }) => {
    // Mock data if none provided
    const chartData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: data || [0, 0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald green
                strokeWidth: 2
            }
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: "#1e293b",
        backgroundGradientTo: "#0f172a",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#10b981"
        }
    };

    return (
        <Box bg="$backgroundCard" rounded="$xl" p="$4" mb="$4">
            <VStack space="sm" mb="$4">
                <Text color="$textLight" fontWeight="bold" size="md">Weekly Earnings</Text>
                <Text color="$green400" size="2xl" fontWeight="bold">
                    ${(data || []).reduce((a, b) => a + b, 0)}
                </Text>
            </VStack>

            <LineChart
                data={chartData}
                width={width - 70} // container padding
                height={180}
                chartConfig={chartConfig}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
                withInnerLines={false}
                withOuterLines={false}
            />
        </Box>
    );
};

export default EarningsChart;

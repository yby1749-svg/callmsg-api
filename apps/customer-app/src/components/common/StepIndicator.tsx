import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, typography} from '@config/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({length: totalSteps}).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.step,
                index <= currentStep ? styles.stepActive : styles.stepInactive,
              ]}>
              <Text
                style={[
                  styles.stepText,
                  index <= currentStep
                    ? styles.stepTextActive
                    : styles.stepTextInactive,
                ]}>
                {index + 1}
              </Text>
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.line,
                  index < currentStep ? styles.lineActive : styles.lineInactive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      {labels && labels[currentStep] && (
        <Text style={styles.label}>{labels[currentStep]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: colors.primary,
  },
  stepInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  stepTextActive: {
    color: colors.textInverse,
  },
  stepTextInactive: {
    color: colors.textLight,
  },
  line: {
    width: 40,
    height: 2,
    marginHorizontal: spacing.xs,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  lineInactive: {
    backgroundColor: colors.border,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

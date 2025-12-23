import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors, spacing} from '@config/theme';

interface CaptchaProps {
  onVerified: (verified: boolean) => void;
}

export function Captcha({onVerified}: CaptchaProps) {
  const [num1, setNum1] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [num2, setNum2] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [operator, setOperator] = useState<'+' | '-'>('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);
  const onVerifiedRef = useRef(onVerified);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  const generateChallenge = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const op = Math.random() > 0.5 ? '+' : '-';

    if (op === '-' && n2 > n1) {
      setNum1(n2);
      setNum2(n1);
    } else {
      setNum1(n1);
      setNum2(n2);
    }
    setOperator(op);
    setUserAnswer('');
    setIsVerified(false);
    setShowError(false);
    onVerifiedRef.current(false);
  };

  const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;

  const handleVerify = () => {
    const answer = parseInt(userAnswer, 10);
    if (answer === correctAnswer) {
      setIsVerified(true);
      setShowError(false);
      onVerifiedRef.current(true);
    } else {
      setShowError(true);
      setIsVerified(false);
      onVerifiedRef.current(false);
      setTimeout(() => {
        generateChallenge();
      }, 1500);
    }
  };

  const handleAnswerChange = (text: string) => {
    const filtered = text.replace(/[^0-9-]/g, '');
    setUserAnswer(filtered);
    setShowError(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text style={styles.title}>Verify you're human</Text>
      </View>

      <View style={styles.challengeContainer}>
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            {num1} {operator} {num2} = ?
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              isVerified && styles.inputVerified,
              showError && styles.inputError,
            ]}
            value={userAnswer}
            onChangeText={handleAnswerChange}
            keyboardType="number-pad"
            placeholder="?"
            placeholderTextColor={colors.textSecondary}
            maxLength={3}
            editable={!isVerified}
          />

          {!isVerified ? (
            <TouchableOpacity
              style={[styles.verifyButton, !userAnswer && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={!userAnswer}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          <TouchableOpacity style={styles.refreshButton} onPress={generateChallenge}>
            <Icon name="refresh-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showError && (
          <Text style={styles.errorText}>Wrong answer. Try again!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 4,
  },
  challengeContainer: {
    alignItems: 'center',
  },
  questionBox: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  inputVerified: {
    borderColor: colors.success,
    backgroundColor: '#f0fdf4',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#fef2f2',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  verifiedText: {
    color: colors.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});

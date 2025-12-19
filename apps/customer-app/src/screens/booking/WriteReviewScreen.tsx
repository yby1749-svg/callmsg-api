import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';

import {bookingsApi, reviewsApi} from '@api';
import {Button} from '@components';
import {useUIStore} from '@store';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '@config/theme';
import type {BookingsStackParamList} from '@navigation';

type RouteProps = RouteProp<BookingsStackParamList, 'WriteReview'>;
type NavigationProps = NativeStackNavigationProp<
  BookingsStackParamList,
  'WriteReview'
>;

export function WriteReviewScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const {bookingId, providerId} = route.params;
  const queryClient = useQueryClient();
  const {showSuccess, showError} = useUIStore();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const {data: booking, isLoading} = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await bookingsApi.getBooking(bookingId);
      return response.data.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await reviewsApi.createReview({
        bookingId,
        targetId: providerId,
        rating,
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['booking', bookingId]});
      queryClient.invalidateQueries({queryKey: ['bookings']});
      queryClient.invalidateQueries({queryKey: ['provider', providerId]});
      showSuccess('Review Submitted', 'Thank you for your feedback!');
      // Navigate to BookingList and show History tab
      navigation.reset({
        index: 0,
        routes: [{name: 'BookingList', params: {tab: 'history'}}],
      });
    },
    onError: () => {
      showError(
        'Submission Failed',
        'Unable to submit review. Please try again.',
      );
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      showError('Rating Required', 'Please select a star rating');
      return;
    }
    submitMutation.mutate();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}>
          <Icon
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? colors.warning : colors.textLight}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Provider Info */}
      {booking?.provider && (
        <View style={styles.section}>
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <Icon name="person" size={32} color={colors.textLight} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>
                {booking.provider.displayName}
              </Text>
              <Text style={styles.serviceName}>{booking.service.name}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Star Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How was your experience?</Text>
        <View style={styles.starsContainer}>{renderStars()}</View>
        <Text style={styles.ratingText}>{getRatingText()}</Text>
      </View>

      {/* Comment Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share your thoughts (optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Tell us about your experience..."
          placeholderTextColor={colors.textLight}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Submit Review"
          onPress={handleSubmit}
          loading={submitMutation.isPending}
          disabled={rating === 0}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  providerAvatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  providerName: {
    ...typography.h3,
    color: colors.text,
  },
  serviceName: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  commentInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 120,
    ...typography.body,
    color: colors.text,
    ...shadows.sm,
  },
  charCount: {
    ...typography.bodySmall,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

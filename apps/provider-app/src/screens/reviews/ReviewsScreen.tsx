import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import {formatDistanceToNow} from 'date-fns';
import Toast from 'react-native-toast-message';

import {reviewsApi} from '@api';
import {Button} from '@components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '@config/theme';
import type {Review} from '@types';

export function ReviewsScreen() {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const {data, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['receivedReviews'],
    queryFn: async () => {
      const response = await reviewsApi.getReceivedReviews({limit: 50});
      return response.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({reviewId, reply}: {reviewId: string; reply: string}) => {
      await reviewsApi.replyToReview(reviewId, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['receivedReviews']});
      Toast.show({type: 'success', text1: 'Reply Sent', text2: 'Your reply has been posted'});
      setReplyingTo(null);
      setReplyText('');
    },
    onError: () => {
      Toast.show({type: 'error', text1: 'Failed', text2: 'Unable to post reply'});
    },
  });

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }
    replyMutation.mutate({reviewId, reply: replyText.trim()});
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? colors.warning : colors.textLight}
        />,
      );
    }
    return stars;
  };

  const renderReview = ({item}: {item: Review}) => (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={20} color={colors.textLight} />
          </View>
          <View>
            <Text style={styles.authorName}>
              {item.author?.firstName} {item.author?.lastName?.charAt(0)}.
            </Text>
            <Text style={styles.serviceName}>
              {item.booking?.service?.name || 'Service'}
            </Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>
          {formatDistanceToNow(new Date(item.createdAt), {addSuffix: true})}
        </Text>
      </View>

      {/* Rating */}
      <View style={styles.ratingRow}>{renderStars(item.rating)}</View>

      {/* Comment */}
      {item.comment && <Text style={styles.comment}>{item.comment}</Text>}

      {/* Reply Section */}
      {item.reply ? (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Your reply:</Text>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      ) : replyingTo === item.id ? (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor={colors.textLight}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={300}
          />
          <View style={styles.replyActions}>
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title="Send"
              size="sm"
              onPress={() => handleReply(item.id)}
              loading={replyMutation.isPending}
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => setReplyingTo(item.id)}>
          <Icon name="chatbubble-outline" size={16} color={colors.primary} />
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const reviews = data?.data || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Reviews</Text>
        <Text style={styles.subtitle}>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="star-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>
            Reviews from your customers will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
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
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  serviceName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.textLight,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: spacing.sm,
  },
  comment: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
  replyContainer: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  replyLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  replyText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  replyButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  replyInputContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  replyInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    minHeight: 80,
    ...typography.body,
    color: colors.text,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  useColorScheme,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Colors, { shadows } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { TipItem } from '@/types';
import TipCard from '@/components/TipCard';
import { getAllTips, getTipsByCategory } from '@/data/tips';
import { TriangleAlert as AlertTriangle, BookOpen, Search, ShieldAlert, X } from 'lucide-react-native';
import Card from '@/components/ui/Card';

export default function EducationScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState<'all' | 'phishing' | 'scam' | 'general'>(
    'all'
  );
  const [selectedTip, setSelectedTip] = useState<TipItem | null>(null);

  const handleSelectTip = (tip: TipItem) => {
    setSelectedTip(tip);
  };

  const filteredTips = React.useMemo(() => {
    if (filter === 'all') {
      return getAllTips();
    }
    return getTipsByCategory(filter);
  }, [filter]);

  const FilterButton = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: 'all' | 'phishing' | 'scam' | 'general';
    icon: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.primaryLight },
      ]}
      onPress={() => setFilter(value)}>
      {icon}
      <Text
        style={[
          styles.filterButtonText,
          { color: filter === value ? '#fff' : colors.primary },
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Security Education
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Learn how to protect yourself online
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton
          title="All Tips"
          value="all"
          icon={<BookOpen size={16} color={filter === 'all' ? '#fff' : colors.primary} />}
        />
        <FilterButton
          title="Phishing"
          value="phishing"
          icon={<AlertTriangle size={16} color={filter === 'phishing' ? '#fff' : colors.primary} />}
        />
        <FilterButton
          title="Scams"
          value="scam"
          icon={<ShieldAlert size={16} color={filter === 'scam' ? '#fff' : colors.primary} />}
        />
      </View>

      {filteredTips.length > 0 ? (
        <FlatList
          data={filteredTips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TipCard tip={item} onPress={handleSelectTip} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Card variant="outlined" style={styles.emptyState}>
          <View style={styles.emptyStateContent}>
            <Search size={48} color={colors.muted} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No Tips Found
            </Text>
            <Text style={[styles.emptyStateMessage, { color: colors.muted }]}>
              Try changing your filter to see more security tips
            </Text>
          </View>
        </Card>
      )}

      <Modal
        visible={!!selectedTip}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTip(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                {selectedTip?.category === 'phishing' && (
                  <AlertTriangle size={24} color={colors.warning} />
                )}
                {selectedTip?.category === 'scam' && (
                  <ShieldAlert size={24} color={colors.danger} />
                )}
                {selectedTip?.category === 'general' && (
                  <BookOpen size={24} color={colors.primary} />
                )}
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedTip?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedTip(null)}
                style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View
              style={[styles.modalBody, { borderTopColor: colors.border }]}>
              <Text style={[styles.modalContent, { color: colors.text }]}>
                {selectedTip?.content}
              </Text>
            </View>
            <View
              style={[
                styles.tipCategoryBadge,
                {
                  backgroundColor:
                    selectedTip?.category === 'phishing'
                      ? colors.warning
                      : selectedTip?.category === 'scam'
                      ? colors.danger
                      : colors.primary,
                },
              ]}>
              <Text style={styles.tipCategoryText}>
                {selectedTip?.category === 'phishing'
                  ? 'Phishing Protection'
                  : selectedTip?.category === 'scam'
                  ? 'Scam Awareness'
                  : 'General Security'}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  header: {
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.round,
    gap: Layout.spacing.xs,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContent: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  emptyStateMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 250,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.md,
  },
  modalContainer: {
    width: '100%',
    borderRadius: Layout.radius.lg,
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    flex: 1,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    flex: 1,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  modalBody: {
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
  },
  modalContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  tipCategoryBadge: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    marginLeft: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderRadius: Layout.radius.round,
    alignSelf: 'flex-start',
  },
  tipCategoryText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
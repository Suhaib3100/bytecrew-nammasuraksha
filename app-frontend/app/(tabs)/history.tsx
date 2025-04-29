import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  useColorScheme,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import HistoryItem from '@/components/HistoryItem';
import ResultCard from '@/components/ResultCard';
import { ScanResult } from '@/types';
import useHistory from '@/hooks/useHistory';
import Button from '@/components/ui/Button';
import { ClipboardList, Search, Trash2 } from 'lucide-react-native';
import Card from '@/components/ui/Card';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { history, clearHistory } = useHistory();
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'safe' | 'scam' | 'phishing'
  >('all');

  const handleSelectItem = (item: ScanResult) => {
    setSelectedResult(item);
  };

  const handleClearHistory = () => {
    clearHistory();
    setSelectedResult(null);
  };

  const filteredHistory = React.useMemo(() => {
    switch (filter) {
      case 'safe':
        return history.filter((item) => item.result === 'Safe');
      case 'scam':
        return history.filter((item) => item.result === 'Scam Detected');
      case 'phishing':
        return history.filter((item) => item.result === 'Phishing Detected');
      default:
        return history;
    }
  }, [history, filter]);

  const FilterButton = ({
    title,
    value,
  }: {
    title: string;
    value: 'all' | 'safe' | 'scam' | 'phishing';
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.primaryLight },
      ]}
      onPress={() => setFilter(value)}>
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
        <Text style={[styles.title, { color: colors.text }]}>Scan History</Text>
        <Button
          title="Clear All"
          variant="outline"
          size="small"
          onPress={handleClearHistory}
          style={styles.clearButton}
          disabled={history.length === 0}
        />
      </View>

      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" />
        <FilterButton title="Safe" value="safe" />
        <FilterButton title="Scams" value="scam" />
        <FilterButton title="Phishing" value="phishing" />
      </View>

      {selectedResult ? (
        <View style={styles.detailsContainer}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => setSelectedResult(null)}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              Back to History
            </Text>
          </TouchableOpacity>
          <ResultCard result={selectedResult} />
        </View>
      ) : (
        <>
          {filteredHistory.length > 0 ? (
            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HistoryItem item={item} onPress={handleSelectItem} />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card variant="outlined" style={styles.emptyState}>
              <View style={styles.emptyStateContent}>
                {history.length === 0 ? (
                  <>
                    <ClipboardList size={48} color={colors.muted} />
                    <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                      No History Yet
                    </Text>
                    <Text style={[styles.emptyStateMessage, { color: colors.muted }]}>
                      When you analyze messages or URLs, they'll appear here
                    </Text>
                  </>
                ) : (
                  <>
                    <Search size={48} color={colors.muted} />
                    <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                      No Matching Results
                    </Text>
                    <Text style={[styles.emptyStateMessage, { color: colors.muted }]}>
                      Try changing your filter to see more results
                    </Text>
                  </>
                )}
              </View>
            </Card>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 28,
  },
  clearButton: {
    paddingHorizontal: Layout.spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.round,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
  detailsContainer: {
    flex: 1,
  },
  backButton: {
    paddingVertical: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
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
});
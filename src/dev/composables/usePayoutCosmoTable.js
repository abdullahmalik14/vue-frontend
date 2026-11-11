import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function usePayoutCosmoTable(activeTab) {
  const { t } = useI18n();

  const payoutRows = computed(() => [
    { id: 1, date: t('payoutCosmo.table.payout1Date'), period: t('payoutCosmo.table.payout1Period'), reference: t('payoutCosmo.table.payout1Reference'), amount: t('payoutCosmo.table.payout1Amount'), status: 'paid', statusLabel: t('payoutCosmo.status.completed') },
    { id: 2, date: t('payoutCosmo.table.payout2Date'), period: t('payoutCosmo.table.payout2Period'), reference: t('payoutCosmo.table.payout2Reference'), amount: t('payoutCosmo.table.payout2Amount'), status: 'paid', statusLabel: t('payoutCosmo.status.completed') },
  ]);

  const withdrawalRows = computed(() => [
    { id: 1, date: t('payoutCosmo.table.withdrawal1Date'), bank: t('payoutCosmo.table.withdrawal1Bank'), account: t('payoutCosmo.table.withdrawal1Account'), amount: t('payoutCosmo.table.withdrawal1Amount'), fee: t('payoutCosmo.table.withdrawal1Fee'), status: 'pending', statusLabel: t('payoutCosmo.status.processing') },
    { id: 2, date: t('payoutCosmo.table.withdrawal2Date'), bank: t('payoutCosmo.table.withdrawal2Bank'), account: t('payoutCosmo.table.withdrawal2Account'), amount: t('payoutCosmo.table.withdrawal2Amount'), fee: t('payoutCosmo.table.withdrawal2Fee'), status: 'paid', statusLabel: t('payoutCosmo.status.completed') },
  ]);

  const cardRows = computed(() => [
    { id: 1, date: t('payoutCosmo.table.card1Date'), type: t('payoutCosmo.table.card1Type'), merchant: t('payoutCosmo.table.card1Merchant'), amount: t('payoutCosmo.table.card1Amount'), status: 'paid', statusLabel: t('payoutCosmo.status.completed') },
    { id: 2, date: t('payoutCosmo.table.card2Date'), type: t('payoutCosmo.table.card2Type'), merchant: t('payoutCosmo.table.card2Merchant'), amount: t('payoutCosmo.table.card2Amount'), status: 'paid', statusLabel: t('payoutCosmo.status.completed') },
  ]);

  const columnsByTab = computed(() => ({
    payouts: [
      { key: 'date', label: t('payoutCosmo.columns.date'), basis: 'min-w-[8.5rem]' },
      { key: 'period', label: t('payoutCosmo.columns.period'), basis: 'min-w-[9rem]' },
      { key: 'reference', label: t('payoutCosmo.columns.reference'), basis: 'min-w-[11rem]', grow: true },
      { key: 'amount', label: t('payoutCosmo.columns.amount'), basis: 'min-w-[8rem]', align: 'right' },
      { key: 'status', label: t('payoutCosmo.columns.status'), basis: 'min-w-[8.5rem]' },
    ],
    withdrawals: [
      { key: 'date', label: t('payoutCosmo.columns.date'), basis: 'min-w-[8.5rem]' },
      { key: 'bank', label: t('payoutCosmo.columns.bank'), basis: 'min-w-[11rem]', grow: true },
      { key: 'account', label: t('payoutCosmo.columns.account'), basis: 'min-w-[8rem]' },
      { key: 'amount', label: t('payoutCosmo.columns.amount'), basis: 'min-w-[8rem]', align: 'right' },
      { key: 'fee', label: t('payoutCosmo.columns.fee'), basis: 'min-w-[6rem]', align: 'right' },
      { key: 'status', label: t('payoutCosmo.columns.status'), basis: 'min-w-[8.5rem]' },
    ],
    cardActivity: [
      { key: 'date', label: t('payoutCosmo.columns.date'), basis: 'min-w-[8.5rem]' },
      { key: 'type', label: t('payoutCosmo.columns.type'), basis: 'min-w-[9rem]' },
      { key: 'merchant', label: t('payoutCosmo.columns.merchant'), basis: 'min-w-[11rem]', grow: true },
      { key: 'amount', label: t('payoutCosmo.columns.amount'), basis: 'min-w-[8rem]', align: 'right' },
      { key: 'status', label: t('payoutCosmo.columns.status'), basis: 'min-w-[8.5rem]' },
    ],
  }));

  const rowsByTab = computed(() => ({
    payouts: payoutRows.value,
    withdrawals: withdrawalRows.value,
    cardActivity: cardRows.value,
  }));

  const activityTabs = computed(() => [
    { label: t('payoutCosmo.page.tabPayouts'), value: 'payouts', count: payoutRows.value.length },
    { label: t('payoutCosmo.page.tabWithdrawals'), value: 'withdrawals', count: withdrawalRows.value.length },
    { label: t('payoutCosmo.page.tabCardActivity'), value: 'cardActivity', count: cardRows.value.length },
  ]);

  const columns = computed(() => columnsByTab.value[activeTab.value] || []);
  const rows = computed(() => rowsByTab.value[activeTab.value] || []);
  const mobileDetailColumns = computed(() => columns.value.filter((col) => !['date', 'amount', 'status'].includes(col.key)));

  return { activityTabs, columns, rows, mobileDetailColumns };
}

/** Mock request/response payloads for the four Cosmo creator journeys. */

export const MOCK_API_MS = 2000;

export function formatMoney(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function createCosmoSession() {
  return {
    creator_id: 'creator-linden',
    provider: 'cosmo',
    payout_schedule: 'Friday',

    cardholder: {
      firstName: 'Linden',
      lastName: 'Creator',
      dateOfBirth: '1990-01-15',
      phone: '+61 400 000 000',
      email: 'creator@example.com',
      address: '12 Example Street, Brisbane QLD 4000',
    },

    documents: {
      idType: 'Passport',
      idTypes: ['Passport', 'Driver licence'],
      idNumber: 'N1234567',
      proofOfIdentity: { documentType: 0, label: 'Proof of identity' },
      proofOfAddress: { documentType: 1, label: 'Proof of address' },
    },

    creator_payout_accounts: {
      creator_id: 'creator-linden',
      provider: 'cosmo',
      san: '123456789',
      issue_id: 'ISSUE-4821',
      masked_pan: '•••• 4821',
      currency: 'AUD',
      kyc_status: 'Approved',
      card_status: 'active',
      created_at: '2026-09-18T00:00:00Z',
      updated_at: '2026-09-25T00:00:00Z',
    },

    ledger: {
      availableEarnings: 2840,
      pendingEarnings: 420,
    },

    walletBalance: 1420.5,
    walletBalanceAfterLoad: 4260.5,
    platformEarningsAfterPayout: 0,

    creator_payouts: {
      id: 'payout-260918',
      creator_id: 'creator-linden',
      period: '11–17 Sep',
      amount: 2840,
      status: 'Completed',
      remote_id: 'PAY-260918-9201',
      provider_transaction_id: 'TX-884921',
      failure_code: '',
      failure_reason: '',
      completed_at: '2026-09-18T00:00:00Z',
    },

    withdrawalAmount: '1000.00',

    creator_withdrawal_methods: [
      {
        id: 'method-cba',
        creator_id: 'creator-linden',
        provider_beneficiary_id: 'BEN-4821',
        country: 'AU',
        currency: 'AUD',
        display_name: 'Commonwealth Bank',
        masked_account: '•••• 4821',
        preview_label: 'Commonwealth •••• 4821',
        status: 'active',
        is_default: true,
        last_used_at: '2026-09-20T00:00:00Z',
      },
      {
        id: 'method-anz',
        creator_id: 'creator-linden',
        provider_beneficiary_id: 'BEN-9918',
        country: 'AU',
        currency: 'AUD',
        display_name: 'ANZ',
        masked_account: '•••• 9918',
        preview_label: 'ANZ •••• 9918',
        status: 'active',
        is_default: false,
        last_used_at: '',
      },
    ],

    selectedMethodId: 'method-cba',

    countries: [
      { code: 'AU', label: 'Australia' },
      { code: 'GB', label: 'United Kingdom' },
      { code: 'US', label: 'United States' },
    ],
    selectedCountry: 'AU',

    acceptableFieldsByCountry: {
      AU: [
        { key: 'accountHolder', label: 'Account holder', value: 'Linden Creator', full: true },
        { key: 'bsb', label: 'BSB', value: '123-456', full: false },
        { key: 'accountNumber', label: 'Account number', value: '12345678', full: false },
      ],
    },

    newBeneficiary: {
      provider_beneficiary_id: 'BEN-5678',
      display_name: 'New AU bank',
      masked_account: '•••• 5678',
      preview_label: 'New AU bank •••• 5678',
      confirm_label: 'Saved',
    },

    preview: {
      savedFeeLabel: 'Preview response',
      newFeeLabel: 'Provider preview',
    },

    creator_withdrawals: {
      id: 'withdrawal-1000',
      creator_id: 'creator-linden',
      withdrawal_method_id: 'method-cba',
      amount: 1000,
      currency: 'AUD',
      status: 'Completed',
      provider_payout_id: 'PO-1000-4821',
      fee_preview: 'Preview response',
      failure_code: '',
      failure_reason: '',
      requested_at: '2026-09-20T00:00:00Z',
      completed_at: '2026-09-20T00:00:00Z',
    },

    operations: {
      lookupSan: 'local.lookupSan',
      createCard: 'Ws_CreateCard',
      submitDocument: 'Ws_SubmitDocumentV2',
      kycStatus: 'Ws_GetKycStatus',
      cardLoad: 'WsCardLoad',
      walletBalance: 'Ws_GetCardBalance',
      getBeneficiaries: 'Ws_GetBeneficiaries',
      secondaryBalance: 'Ws_GetSecondaryBalance',
      cardToAccount: 'Ws_CardToAccount',
      payoutPreview: 'Ws_BeneficiaryPayoutPreview',
      payout: 'Ws_BeneficiaryPayout',
      payoutStatus: 'Ws_PayoutStatus',
      getCountries: 'Ws_BeneficiaryGetCountries',
      acceptableFields: 'Ws_BeneficiaryGetAcceptableFields',
      createBeneficiary: 'Ws_BeneficiaryCreate',
    },
  };
}

export function buildCosmoRequests(session) {
  const account = session.creator_payout_accounts;
  const payout = session.creator_payouts;
  const method = session.creator_withdrawal_methods.find((item) => item.id === session.selectedMethodId);
  const fields = session.acceptableFieldsByCountry[session.selectedCountry] || [];

  return {
    lookupSan: { creator_id: session.creator_id },
    createCard: { ...session.cardholder, currency: account.currency },
    submitDocument: {
      san: account.san,
      documents: [
        { documentType: session.documents.proofOfIdentity.documentType, idType: session.documents.idType, idNumber: session.documents.idNumber },
        { documentType: session.documents.proofOfAddress.documentType },
      ],
    },
    kycStatus: { san: account.san },
    cardLoad: { san: account.san, currency: account.currency, amount: payout.amount, remote_id: payout.remote_id },
    getBeneficiaries: { san: account.san },
    payoutPreview: { provider_beneficiary_id: method?.provider_beneficiary_id, amount: Number(session.withdrawalAmount), currency: account.currency },
    payout: { provider_beneficiary_id: method?.provider_beneficiary_id, amount: Number(session.withdrawalAmount), currency: account.currency },
    getCountries: { provider: session.provider },
    acceptableFields: { country: session.selectedCountry, partner: session.provider },
    createBeneficiary: {
      country: session.selectedCountry,
      fields: Object.fromEntries(fields.map((field) => [field.key, field.value])),
    },
  };
}

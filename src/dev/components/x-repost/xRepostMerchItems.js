export const MERCH_PICKER_ITEMS = [
  {
    id: 'merch-1',
    title: 'Record breaking fried chicken eating ! See my collection now',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-2',
    title: 'Limited edition summer drop — grab yours before it sells out',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-3',
    title: 'Signed poster bundle with exclusive behind-the-scenes content',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-4',
    title: 'Premium hoodie collection — soft, warm, and fan favorite',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-5',
    title: 'Record breaking fried chicken eating ! See my collection now',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-6',
    title: 'Limited edition summer drop — grab yours before it sells out',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-7',
    title: 'Signed poster bundle with exclusive behind-the-scenes content',
    thumbnail: '/images/checkout-header.webp',
  },
  {
    id: 'merch-8',
    title: 'Premium hoodie collection — soft, warm, and fan favorite',
    thumbnail: '/images/checkout-header.webp',
  },
];

export function merchItemById(id) {
  return MERCH_PICKER_ITEMS.find((item) => item.id === id) || null;
}

export function filterMerchItems(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return MERCH_PICKER_ITEMS;
  return MERCH_PICKER_ITEMS.filter((item) => item.title.toLowerCase().includes(normalized));
}

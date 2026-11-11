/**
 * ordersMapper.js
 *
 * Transforms raw API order data into the format expected by the Dashboard Table.
 */

import { resolveOrderTypeAssetFlag } from '@/dev/composables/useOrdersAssets.js';

function mapOrderStatus(status) {
  const normalized = String(status || 'processing').toLowerCase();
  if (normalized === 'processing' || normalized === 'in progress') return 'In Progress';
  if (normalized === 'completed' || normalized === 'shipped') return 'Completed';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export const mapOrdersFromResponse = (response) => {
  if (!response || !Array.isArray(response.items)) {
    return { items: [], totalCount: 0, pagination: {} };
  }

  const items = response.items.map((order) => {
    const dateObj = new Date(order.created_at || Date.now());
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const orderType = order.type || 'merch';

    return {
      id: order.order_id,
      orderNum: `#ORD-${order.order_id.toString().slice(-6).toUpperCase()}`,
      date: formattedDate,
      type: orderType,
      customer: order.customer_name || '__GUEST__',
      from: order.customer_name || '__GUEST__',
      fromLabelKey: order.customer_name ? null : 'dashboard.orders.guestUser',
      fromAvatar: null,
      total: `$${(order.total || 0).toFixed(2)}`,
      status: mapOrderStatus(order.status),
      icon: null,
      iconAssetFlag: resolveOrderTypeAssetFlag(orderType),
      iconBg: orderType === 'subscription' ? '#07F468' : '#000',
      raw: order,
    };
  });

  return {
    items,
    totalCount: response.totalCount || items.length,
    pagination: response.pagination || {
      currentPage: 1,
      totalPages: 1,
    },
    meta: {
      etag: response.etag,
    },
  };
};

export const mapOrderToRequest = (payload) => {
  return {
    // Transform frontend filters to backend query params
    status: payload.status?.toLowerCase(),
    type: payload.type?.toLowerCase(),
    search: payload.search,
    page: payload.page || 1,
    per_page: payload.perPage || 10,
    owner_id: payload.ownerId, // For "Orders Received"
    customer_id: payload.customerId, // For "Items Purchased"
  };
};

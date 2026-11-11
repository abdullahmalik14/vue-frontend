import MockApi from "@/lib/mock-api-demo/MockApi.js";
import mockApiConfig from "@/lib/mock-api-demo/mockApi.config.js";

export const CHECKOUT_MOCK_SCENARIOS = ["success", "failure", "ask"];

const mockApi = new MockApi(mockApiConfig);
const listeners = new Set();

let activeScenario = "success";
let lastResult = null;

function notify(result) {
  lastResult = result;
  listeners.forEach((fn) => {
    try {
      fn(result);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

async function toResult(label, response) {
  const body = typeof response?.json === "function" ? await response.json() : response;
  const result = {
    label,
    status: response?.status ?? null,
    ok: Boolean(response?.ok),
    scenario: activeScenario,
    body,
    at: new Date().toISOString(),
  };
  notify(result);
  return result;
}

export function setCheckoutMockScenario(name) {
  if (CHECKOUT_MOCK_SCENARIOS.includes(name)) {
    activeScenario = name;
  }
  return activeScenario;
}

export function getCheckoutMockScenario() {
  return activeScenario;
}

export function getLastCheckoutMockResult() {
  return lastResult;
}

export function onCheckoutMockResult(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function mockCheckoutCart(payload = {}) {
  const scenario = payload.scenario || activeScenario;
  const response = await mockApi.post("/checkout/cart", { ...payload, scenario });
  return toResult("POST /checkout/cart", response);
}

export async function mockCheckoutPay(payload = {}) {
  const scenario = payload.scenario || activeScenario;
  const response = await mockApi.post("/checkout/pay", { ...payload, scenario });
  return toResult("POST /checkout/pay", response);
}

export async function mockCheckoutStatus(query = {}) {
  const scenario = query.scenario || activeScenario;
  const response = await mockApi.get("/checkout/status", {
    query: { ...query, scenario },
  });
  return toResult("GET /checkout/status", response);
}

export async function submitCheckoutPayment({
  flowType,
  items,
  product,
  notes,
  scenario,
} = {}) {
  const cart = await mockCheckoutCart({
    flowType,
    items,
    product,
    notes,
    scenario,
  });

  if (!cart.ok && cart.body?.status !== "ask") {
    return cart;
  }

  return mockCheckoutPay({
    cartId: cart.body?.cartId || "cart-demo-1",
    flowType,
    scenario,
  });
}

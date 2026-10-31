import { ProfileApi } from '@/apis/my/profile/profile.api';
import { OrderCreateRESP } from '@/apis/order/order.response';
import { TokenService } from '@/config';
import { TOSS_CLIENT_KEY } from '@/constants/common';
import { useLoginStore } from '@/hooks';
import { ROUTES } from '@/routes';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const ensureAuthenticatedForPayment = async () => {
  const accessToken = TokenService.getAccessToken();

  // Proxy-login exchanges provide a valid, short-lived access token but no
  // refresh token. ProfileApi.get below remains the authoritative check that
  // the active session can make authenticated requests.
  if (!accessToken) {
    useLoginStore.getState().openLoginModal();
    return false;
  }

  try {
    await ProfileApi.get();
    return true;
  } catch {
    useLoginStore.getState().openLoginModal();
    return false;
  }
};

export const handlePayment = async (onCancelPayment: () => void, order?: OrderCreateRESP) => {
  if (!order) return;

  const isAuthenticated = await ensureAuthenticatedForPayment();
  if (!isAuthenticated) return;

  try {
    const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY as string);
    // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
    const payment = tossPayments.payment({
      customerKey: 'TEST',
    });

    const successUrl = `${window.location.origin}${ROUTES.ORDER_SUCCESS}`;
    const failUrl = `${window.location.origin}${ROUTES.ORDER_FAIL}`;

    // const successUrl = order?.userCoupon ? `${baseSuccessUrl}?userCoupon=${order.userCoupon}` : baseSuccessUrl;

    await payment.requestPayment({
      method: 'CARD',
      amount: {
        currency: 'KRW',
        value: Math.round(Number(order?.totals.total) || 0),
      },
      orderId: order?.order_number || '',
      orderName: order?.order_number || '',
      successUrl,
      failUrl,
      customerName: order?.user.name,
      customerEmail: order?.user.email,
      customerMobilePhone: order?.user.mobile,
      card: {
        useEscrow: false,
        flowMode: 'DEFAULT',
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
  } catch (error: unknown) {
    onCancelPayment();
    console.log(error);
  }
};

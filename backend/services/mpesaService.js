require('dotenv').config();
const axios = require('axios');

class MpesaService {
  static validateCallbackUrl(callbackUrl) {
    if (!callbackUrl) {
      throw new Error('MPESA_CALLBACK_URL is missing. Set it to your public HTTPS callback URL, e.g. https://your-domain.com/api/mpesa/callback');
    }

    try {
      const url = new URL(callbackUrl);
      const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
      if (url.protocol !== 'https:' || isLocalhost) {
        throw new Error('MPESA_CALLBACK_URL must be a public HTTPS URL and cannot be localhost. Use a tunnel such as ngrok or a deployed HTTPS domain.');
      }
      return callbackUrl;
    } catch (error) {
      if (error.message.includes('MPESA_CALLBACK_URL')) {
        throw error;
      }
      throw new Error('MPESA_CALLBACK_URL is invalid. Use a valid public HTTPS URL such as https://your-domain.com/api/mpesa/callback');
    }
  }

  static async getAccessToken() {
    const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Basic ${auth}` },
      });
      return response.data.access_token;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  static async initiateStkPush(phoneNumber, amount, transactionDesc) {
    const { MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;
    const safeCallbackUrl = this.validateCallbackUrl(MPESA_CALLBACK_URL);
    const accessToken = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: safeCallbackUrl,
      AccountReference: 'Laptop Payment',
      TransactionDesc: transactionDesc || 'Payment for laptop',
      ResponseType: 'Completed'
    };

    // Log full payload details for debugging
    console.log('🚀 Initiating STK Push with payload:', {
      ...payload,
      Password: '***HIDDEN***',
      CallBackURL: safeCallbackUrl,
      Amount: amount,
      PhoneNumber: phoneNumber
    });

    try {
      const timestamp = new Date().toISOString();
      console.log(`🚀 [${timestamp}] Sending STK push request...`);
      
      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('✅ STK Push Response:', response.data);
      return {
        ...response.data,
        CheckoutRequestID: response.data.CheckoutRequestID
      }
    } catch (error) {
      console.error('❌ STK Push Error:', error.response?.data || error.message);
      throw new Error(`STK Push failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  static async queryTransactionStatus(checkoutRequestId) {
    try {
      const timestamp = new Date().toISOString();
      console.log(`🔍 [${timestamp}] Querying status for ${checkoutRequestId}`);

      const accessToken = await this.getAccessToken();
      const { MPESA_SHORTCODE, MPESA_PASSKEY } = process.env;
      const currentTimestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${currentTimestamp}`).toString('base64');

      const payload = {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: currentTimestamp,
        CheckoutRequestID: checkoutRequestId
      };

      try {
        const response = await axios.post(
          'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000 // 15 second timeout
          }
        );

        console.log(`✅ [${timestamp}] Status query response:`, response.data);

        // Handle specific error codes from M-Pesa
        if (response.data.ResultCode === "1037") {
          return {
            ResultCode: 1,
            ResultDesc: "Timeout waiting for user input"
          };
        } else if (response.data.ResultCode === "1032") {
          return {
            ResultCode: 1,
            ResultDesc: "Transaction cancelled by user"
          };
        }

        return response.data;

      } catch (axiosError) {
        // Handle network timeouts separately
        if (axiosError.code === 'ECONNABORTED') {
          return {
            ResultCode: 1,
            ResultDesc: "Network timeout while checking status"
          };
        }

        // Handle other HTTP errors
        if (axiosError.response?.status === 404) {
          return {
            ResultCode: 1,
            ResultDesc: "Transaction not found"
          };
        }

        throw axiosError;
      }
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Status query error:`, error.response?.data || error.message);
      return {
        ResultCode: 1,
        ResultDesc: error.message || "Failed to check transaction status"
      };
    }
  }
}

module.exports = MpesaService;

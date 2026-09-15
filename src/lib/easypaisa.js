import crypto from 'crypto';

// Easypaisa Payment Service
// Official API Integration for OTC (Over the Counter) and MA (Mobile Account) transactions

class EasypaisaService {
  constructor() {
    this.merchantId = process.env.EASYPAISA_MERCHANT_ID;
    this.storeId = process.env.EASYPAISA_STORE_ID;
    this.password = process.env.EASYPAISA_PASSWORD;
    this.apiUrl = process.env.EASYPAISA_API_URL;
    this.otcUrl = process.env.EASYPAISA_OTC_URL;
    this.maUrl = process.env.EASYPAISA_MA_URL;
    this.inquireUrl = process.env.EASYPAISA_INQUIRE_URL;
  }

  /**
   * Generate basic auth header for Easypaisa API
   * Format: base64(merchantId:password)
   */
  getAuthHeader() {
    const authString = `${this.merchantId}:${this.password}`;
    return `Basic ${Buffer.from(authString).toString('base64')}`;
  }

  /**
   * Initiate OTC (Over the Counter) Transaction
   * Customer pays at Easypaisa shop using a token
   */
  async initiateOTCTransaction(orderData) {
    const {
      orderId,
      amount,
      msisdn,
      emailAddress,
      tokenExpiry,
      optional1 = '',
      optional2 = '',
      optional3 = '',
      optional4 = '',
      optional5 = ''
    } = orderData;

    if (!orderId || !amount || !msisdn || !emailAddress || !tokenExpiry) {
      throw new Error('Missing required fields for OTC transaction');
    }

    const payload = {
      orderId: orderId.toString(),
      storeId: parseInt(this.storeId),
      transactionAmount: parseFloat(amount),
      transactionType: 'OTC',
      msisdn: msisdn,
      emailAddress: emailAddress,
      tokenExpiry: tokenExpiry,
      optional1,
      optional2,
      optional3,
      optional4,
      optional5
    };

    try {
      const response = await fetch(this.otcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Easypaisa OTC API Error: ${data.message || response.statusText}`);
      }

      return {
        success: true,
        data: data,
        transactionId: data.transactionId || null,
        token: data.token || null,
        amount: data.amount || amount,
        status: data.status || 'PENDING'
      };
    } catch (error) {
      console.error('Easypaisa OTC Transaction Error:', error);
      throw error;
    }
  }

  /**
   * Initiate MA (Mobile Account) Transaction
   * Customer pays directly from their Easypaisa mobile account
   */
  async initiateMATransaction(orderData) {
    const {
      orderId,
      amount,
      msisdn,
      emailAddress,
      tokenExpiry,
      optional1 = '',
      optional2 = '',
      optional3 = '',
      optional4 = '',
      optional5 = ''
    } = orderData;

    if (!orderId || !amount || !msisdn || !emailAddress || !tokenExpiry) {
      throw new Error('Missing required fields for MA transaction');
    }

    const payload = {
      orderId: orderId.toString(),
      storeId: parseInt(this.storeId),
      transactionAmount: parseFloat(amount),
      transactionType: 'MA',
      msisdn: msisdn,
      emailAddress: emailAddress,
      tokenExpiry: tokenExpiry,
      optional1,
      optional2,
      optional3,
      optional4,
      optional5
    };

    try {
      const response = await fetch(this.maUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Easypaisa MA API Error: ${data.message || response.statusText}`);
      }

      return {
        success: true,
        data: data,
        transactionId: data.transactionId || null,
        amount: data.amount || amount,
        status: data.status || 'PENDING'
      };
    } catch (error) {
      console.error('Easypaisa MA Transaction Error:', error);
      throw error;
    }
  }

  /**
   * Inquire Transaction Status
   * Check the status of a transaction using transaction ID
   */
  async inquireTransactionStatus(transactionId) {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    try {
      const response = await fetch(`${this.inquireUrl}/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Easypaisa Inquire API Error: ${data.message || response.statusText}`);
      }

      return {
        success: true,
        data: data,
        transactionId: data.transactionId || transactionId,
        status: this.mapEasypaisaStatus(data.status),
        amount: data.amount,
        responseCode: data.responseCode,
        responseMessage: data.responseMessage
      };
    } catch (error) {
      console.error('Easypaisa Transaction Inquiry Error:', error);
      throw error;
    }
  }

  /**
   * Map Easypaisa status to internal payment status
   */
  mapEasypaisaStatus(easypaisaStatus) {
    const statusMap = {
      'SUCCESS': 'PAID',
      'COMPLETED': 'PAID',
      'PENDING': 'PENDING',
      'FAILED': 'FAILED',
      'REJECTED': 'FAILED',
      'CANCELLED': 'FAILED',
      'REFUNDED': 'REFUNDED'
    };

    return statusMap[easypaisaStatus] || 'PENDING';
  }

  /**
   * Generate token expiry datetime
   * Default: 24 hours from now
   */
  generateTokenExpiry(hours = 24) {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry.toISOString().replace(/[-:]/g, '').slice(0, 14); // Format: yyyymmddHHmmss
  }

  /**
   * Validate phone number format (Pakistan: 03xxxxxxxxx)
   */
  validatePhoneNumber(msisdn) {
    const phoneRegex = /^03\d{9}$/;
    return phoneRegex.test(msisdn);
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const easypaisaService = new EasypaisaService();

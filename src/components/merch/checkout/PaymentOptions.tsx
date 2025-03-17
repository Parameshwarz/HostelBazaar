import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  Smartphone,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PaymentOptionsProps {
  amount: number;
  onPaymentComplete: (paymentMethod: string) => void;
}

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  supportedBanks?: string[];
  upiApps?: string[];
}

export default function PaymentOptions({ amount, onPaymentComplete }: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      title: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      id: 'upi',
      title: 'UPI',
      description: 'Pay using any UPI app',
      icon: <Smartphone className="w-6 h-6" />,
      upiApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'],
    },
    {
      id: 'netbanking',
      title: 'Net Banking',
      description: 'Pay through your bank account',
      icon: <Wallet className="w-6 h-6" />,
      supportedBanks: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'],
    },
    {
      id: 'meal_card',
      title: 'Student Meal Card',
      description: 'Use your meal card balance',
      icon: <DollarSign className="w-6 h-6" />,
    },
  ];

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    // Validate based on payment method
    if (selectedMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv) {
        setError('Please fill in all card details');
        setLoading(false);
        return;
      }
    } else if (selectedMethod === 'upi') {
      if (!upiId) {
        setError('Please enter UPI ID');
        setLoading(false);
        return;
      }
    }

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      onPaymentComplete(selectedMethod!);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Payment Options</h3>
              <p className="text-gray-600">Choose your preferred payment method</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-2xl font-bold text-emerald-600">₹{amount.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedMethod === method.id
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-100 hover:border-emerald-200'
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`text-emerald-600 ${selectedMethod === method.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{method.title}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Details Form */}
        <AnimatePresence mode="wait">
          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {selectedMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2
                        focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2
                          focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2
                          focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2
                      focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {paymentMethods
                      .find((m) => m.id === 'upi')
                      ?.upiApps?.map((app) => (
                        <button
                          key={app}
                          className="px-4 py-2 border rounded-lg hover:bg-emerald-50
                            hover:border-emerald-200 transition-colors text-sm"
                        >
                          {app}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {paymentMethods
                    .find((m) => m.id === 'netbanking')
                    ?.supportedBanks?.map((bank) => (
                      <button
                        key={bank}
                        className="px-4 py-2 border rounded-lg hover:bg-emerald-50
                          hover:border-emerald-200 transition-colors"
                      >
                        {bank}
                      </button>
                    ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg
                  hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Pay Securely
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Your payment is secured with industry-standard encryption
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
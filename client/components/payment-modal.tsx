"use client";
import { useState, useEffect } from "react";
import { X, Copy, DollarSign, ExternalLink, CheckCircle } from "lucide-react";

type PaymentMethod = "Venmo" | "Zelle" | "PayPal";

interface PayerInfo {
  user_id: number;
  name: string;
  payment_method: PaymentMethod | null;
  payment_handle: string | null;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  billId: number;
  billName: string;
  amount: number;
  onSuccess: () => void;
}

const getPaymentLink = (method: PaymentMethod, handle: string) => {
  switch (method) {
    case "Venmo":
      return `https://venmo.com/${handle}`;
    case "PayPal":
      return `https://paypal.me/${handle}`;
    case "Zelle":
      return null; // Zelle doesn't have web links
    default:
      return null;
  }
};

const PaymentModal = ({ isOpen, onClose, billId, billName, amount, onSuccess }: PaymentModalProps) => {
  const [payerInfo, setPayerInfo] = useState<PayerInfo | null>(null);
  const [status, setStatus] = useState<"paid" | "unpaid">("unpaid");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && billId) {
      fetchPayerInfo();
    }
  }, [isOpen, billId]);

  const fetchPayerInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/${billId}/payer-info`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setPayerInfo(data.payer);
      }
    } catch (error) {
      console.error("Error fetching payer info:", error);
    }
  };

  const handleCopy = async () => {
    if (payerInfo?.payment_handle) {
      await navigator.clipboard.writeText(payerInfo.payment_handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/${billId}/update-payment-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const paymentLink = payerInfo?.payment_method && payerInfo?.payment_handle
    ? getPaymentLink(payerInfo.payment_method, payerInfo.payment_handle)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pay Bill</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Bill Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Bill</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{billName}</div>
            <div className="text-2xl font-bold text-orange-500 mt-1">
              ${amount.toFixed(2)}
            </div>
          </div>

          {/* Payer Info */}
          {payerInfo && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pay to</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {payerInfo.name}
              </div>

              {payerInfo.payment_method && payerInfo.payment_handle ? (
                <>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payerInfo.payment_method}
                      </div>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {payerInfo.payment_handle}
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {paymentLink && (
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <span>Open {payerInfo.payment_method}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Payment information not available
                </div>
              )}
            </div>
          )}

          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "paid" | "unpaid")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

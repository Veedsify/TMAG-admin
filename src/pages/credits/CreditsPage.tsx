import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  History,
  Tag,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  useCompanies,
  useCompanyPricing,
  useCompanyCreditQuote,
  useInitiateCompanyCreditPurchase,
  useVerifyCompanyCreditPurchase,
  useCompanyCreditHistory,
} from "../../api/hooks";
import type { Company, CompanyCreditQuote, CompanyCreditPurchase } from "../../api/types";

type CheckoutStep = "select" | "review" | "processing" | "success" | "failed";

export default function CreditsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: companiesData } = useCompanies();
  const companies: Company[] = companiesData || [];

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [credits, setCredits] = useState<number>(50);
  const [step, setStep] = useState<CheckoutStep>("select");
  const [quote, setQuote] = useState<CompanyCreditQuote | null>(null);
  const [txRef, setTxRef] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: pricing } = useCompanyPricing(selectedCompanyId);
  const quoteMutation = useCompanyCreditQuote();
  const initiateMutation = useInitiateCompanyCreditPurchase();
  const verifyMutation = useVerifyCompanyCreditPurchase();
  const { data: purchaseHistory } = useCompanyCreditHistory(
    showHistory ? selectedCompanyId : undefined
  );

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.industry || "").toLowerCase().includes(companySearch.toLowerCase())
  );

  // Handle Flutterwave callback
  const handleCallback = useCallback(
    async (txRefParam: string, status: string | null, transactionId: string | null) => {
      setStep("processing");
      setTxRef(txRefParam);

      if (status && status !== "successful" && status !== "completed") {
        setStep("failed");
        setErrorMsg(
          status === "cancelled"
            ? "Payment was cancelled"
            : `Payment ${status}`
        );
        return;
      }

      try {
        const result = await verifyMutation.mutateAsync({
          txRef: txRefParam,
          transactionId: transactionId || undefined,
        });
        const responseData = result.data?.data;
        if (responseData?.success) {
          setStep("success");
        } else {
          setStep("failed");
          setErrorMsg(
            responseData?.purchase?.failedReason || "Payment verification failed"
          );
        }
      } catch (err: any) {
        setStep("failed");
        setErrorMsg(err?.response?.data?.message || "Verification failed");
      }

      // Clean URL params
      setSearchParams({}, { replace: true });
    },
    [verifyMutation, setSearchParams]
  );

  // Check for callback params on mount
  useEffect(() => {
    const txRefParam = searchParams.get("tx_ref");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");

    if (txRefParam) {
      handleCallback(txRefParam, status, transactionId);
    }
  }, []);

  const handleGetQuote = async () => {
    if (!selectedCompanyId || !credits) return;

    try {
      const result = await quoteMutation.mutateAsync({
        companyId: selectedCompanyId,
        credits,
      });
      setQuote(result.data?.data || null);
      setStep("review");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to get quote");
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedCompanyId || !credits) return;

    setStep("processing");
    try {
      const result = await initiateMutation.mutateAsync({
        companyId: selectedCompanyId,
        credits,
      });
      const data = result.data?.data;
      if (data?.paymentLink) {
        setTxRef(data.txRef);
        window.location.href = data.paymentLink;
      } else {
        setStep("failed");
        setErrorMsg("No payment link received");
      }
    } catch (err: any) {
      setStep("failed");
      setErrorMsg(err?.response?.data?.message || "Failed to initiate payment");
    }
  };

  const resetFlow = () => {
    setStep("select");
    setQuote(null);
    setTxRef("");
    setErrorMsg("");
  };

  const sym = pricing?.currencySymbol || "₦";

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-heading">
            Company Credit Purchase
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Purchase credits for companies at their billing currency rates
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            showHistory
              ? "bg-accent text-white"
              : "bg-button-secondary border border-border text-heading hover:bg-background-secondary"
          )}
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Payment Status Banner */}
      {step === "success" && (
        <div className="bg-success/10 border border-success/30 rounded-2xl p-6 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-success shrink-0" />
          <div className="flex-1">
            <p className="text-heading font-semibold">Payment Successful</p>
            <p className="text-sm text-muted">
              Credits have been added to the company account.
            </p>
          </div>
          <button
            onClick={resetFlow}
            className="px-4 py-2 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90"
          >
            New Purchase
          </button>
        </div>
      )}

      {step === "failed" && (
        <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 flex items-center gap-4">
          <XCircle className="w-8 h-8 text-danger shrink-0" />
          <div className="flex-1">
            <p className="text-heading font-semibold">Payment Failed</p>
            <p className="text-sm text-muted">{errorMsg}</p>
          </div>
          <button
            onClick={resetFlow}
            className="px-4 py-2 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Step 1: Select Company & Credits */}
      {(step === "select" || step === "review") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Company & Credit Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Selector */}
            <div className="bg-white rounded-2xl border border-border-light/50 p-6">
              <h2 className="text-base font-semibold text-heading mb-4">
                Select Company
              </h2>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-background-primary border border-border rounded-xl text-sm text-left"
                >
                  <span className={selectedCompany ? "text-heading" : "text-muted"}>
                    {selectedCompany
                      ? `${selectedCompany.name} (${selectedCompany.industry || "N/A"})`
                      : "Choose a company..."}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="text"
                          placeholder="Search companies..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-background-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCompanies.length === 0 ? (
                        <p className="text-sm text-muted p-4 text-center">
                          No companies found
                        </p>
                      ) : (
                        filteredCompanies.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCompanyId(c.id);
                              setDropdownOpen(false);
                              setQuote(null);
                              setStep("select");
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 hover:bg-background-primary transition-colors flex items-center justify-between",
                              selectedCompanyId === c.id && "bg-accent/5"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium text-heading">
                                {c.name}
                              </p>
                              <p className="text-xs text-muted">
                                {c.industry || "No industry"} · {c.activeEmployees}{" "}
                                employees
                              </p>
                            </div>
                            {selectedCompanyId === c.id && (
                              <CheckCircle className="w-4 h-4 text-accent" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info */}
              {pricing && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-background-primary rounded-xl p-3">
                    <p className="text-xs text-muted">Currency</p>
                    <p className="text-sm font-semibold text-heading">
                      {pricing.currency} ({pricing.currencySymbol})
                    </p>
                  </div>
                  <div className="bg-background-primary rounded-xl p-3">
                    <p className="text-xs text-muted">Per Credit</p>
                    <p className="text-sm font-semibold text-heading">
                      {pricing.currencySymbol}
                      {pricing.pricePerCredit.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-background-primary rounded-xl p-3">
                    <p className="text-xs text-muted">Total Credits</p>
                    <p className="text-sm font-semibold text-heading">
                      {pricing.totalCredits.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-background-primary rounded-xl p-3">
                    <p className="text-xs text-muted">Used Credits</p>
                    <p className="text-sm font-semibold text-heading">
                      {pricing.usedCredits.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Credit Quantity */}
            {pricing && (
              <div className="bg-white rounded-2xl border border-border-light/50 p-6">
                <h2 className="text-base font-semibold text-heading mb-4">
                  Select Credit Quantity
                </h2>

                {/* Quick select packages */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[50, 100, 200].map((qty) => {
                    const baseTotal = qty * pricing.pricePerCredit;
                    let discountLabel = "";
                    if (
                      pricing.discountTier3Threshold &&
                      baseTotal >= pricing.discountTier3Threshold
                    ) {
                      discountLabel = "Best Value!";
                    } else if (
                      pricing.discountTier2Threshold &&
                      baseTotal >= pricing.discountTier2Threshold
                    ) {
                      discountLabel = "Great Discount!";
                    } else if (
                      pricing.discountTier1Threshold &&
                      baseTotal >= pricing.discountTier1Threshold
                    ) {
                      discountLabel = "Bulk Discount!";
                    }

                    return (
                      <button
                        key={qty}
                        onClick={() => {
                          setCredits(qty);
                          setQuote(null);
                          setStep("select");
                        }}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all",
                          credits === qty
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        {discountLabel && (
                          <span className="absolute -top-2 right-2 px-2 py-0.5 bg-accent text-white text-[10px] font-semibold rounded-full">
                            {discountLabel}
                          </span>
                        )}
                        <span className="text-2xl font-serif font-bold text-heading block">
                          {qty}
                        </span>
                        <span className="text-xs text-muted">credits</span>
                        <span className="text-sm font-semibold text-heading block mt-2">
                          {sym}
                          {baseTotal.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom amount */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted whitespace-nowrap">
                    Custom amount:
                  </label>
                  <input
                    type="number"
                    min={pricing.minCredits}
                    max={pricing.maxCredits}
                    value={credits}
                    onChange={(e) => {
                      setCredits(parseInt(e.target.value) || 0);
                      setQuote(null);
                      setStep("select");
                    }}
                    className="w-32 px-3 py-2 bg-background-primary border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <span className="text-xs text-muted">
                    Min: {pricing.minCredits} / Max: {pricing.maxCredits}
                  </span>
                </div>

                {/* Volume Discount Info */}
                <div className="mt-4 space-y-1">
                  {pricing.discountTier1Threshold && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Spend {sym}
                      {pricing.discountTier1Threshold.toLocaleString()}+ save{" "}
                      {sym}
                      {pricing.discountTier1Amount?.toLocaleString()}
                    </p>
                  )}
                  {pricing.discountTier2Threshold && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Spend {sym}
                      {pricing.discountTier2Threshold.toLocaleString()}+ save{" "}
                      {sym}
                      {pricing.discountTier2Amount?.toLocaleString()}
                    </p>
                  )}
                  {pricing.discountTier3Threshold && (
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Spend {sym}
                      {pricing.discountTier3Threshold.toLocaleString()}+ save{" "}
                      {sym}
                      {pricing.discountTier3Amount?.toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleGetQuote}
                  disabled={
                    !selectedCompanyId ||
                    credits < pricing.minCredits ||
                    credits > pricing.maxCredits ||
                    quoteMutation.isPending
                  }
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quoteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continue <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {!selectedCompanyId && (
              <div className="bg-white rounded-2xl border border-border-light/50 p-12 text-center">
                <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-heading font-medium">
                  Select a company to get started
                </p>
                <p className="text-sm text-muted mt-1">
                  Pricing will be shown in the company's billing currency
                </p>
              </div>
            )}
          </div>

          {/* Right: Quote Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-border-light/50 p-6 sticky top-6">
              <h2 className="text-base font-semibold text-heading mb-4">
                Order Summary
              </h2>

              {!quote ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted">
                    {selectedCompanyId
                      ? "Select credits and click Continue"
                      : "Select a company first"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Company</span>
                    <span className="text-heading font-medium">
                      {quote.companyName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Credits</span>
                    <span className="text-heading font-medium">
                      {quote.credits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Price per credit</span>
                    <span className="text-heading font-medium">
                      {quote.currencySymbol}
                      {quote.pricePerCredit.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-heading">
                      {quote.currencySymbol}
                      {quote.basePrice.toLocaleString()}
                    </span>
                  </div>
                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-success flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Discount ({quote.appliedDiscountTier})
                      </span>
                      <span className="text-success font-medium">
                        -{quote.currencySymbol}
                        {quote.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-heading font-semibold">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-serif font-bold text-heading">
                        {quote.currencySymbol}
                        {quote.totalAmount.toLocaleString()}
                      </span>
                      <span className="block text-xs text-muted">
                        {quote.currency}
                      </span>
                    </div>
                  </div>

                  {step === "review" && (
                    <button
                      onClick={handleInitiatePayment}
                      disabled={initiateMutation.isPending}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-dark text-white rounded-xl text-sm font-semibold hover:bg-dark/90 transition-colors disabled:opacity-50"
                    >
                      {initiateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {step === "processing" && (
        <div className="bg-white rounded-2xl border border-border-light/50 p-16 text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-heading font-medium text-lg">
            Processing payment...
          </p>
          <p className="text-sm text-muted mt-1">
            {txRef && (
              <span className="font-mono">Ref: {txRef}</span>
            )}
          </p>
        </div>
      )}

      {/* Purchase History */}
      {showHistory && (
        <div className="bg-white rounded-2xl border border-border-light/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light/50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-heading">
              Purchase History
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-muted hover:text-heading"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Company
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Credits
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Currency
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left p-4 text-muted font-medium text-xs uppercase tracking-wide">
                    Ref
                  </th>
                </tr>
              </thead>
              <tbody>
                {!purchaseHistory || purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      No purchase history found
                    </td>
                  </tr>
                ) : (
                  (purchaseHistory as CompanyCreditPurchase[]).map(
                    (purchase) => (
                      <tr
                        key={purchase.id}
                        className="border-b border-border-light/50 last:border-0"
                      >
                        <td className="p-4 text-muted text-xs whitespace-nowrap">
                          {new Date(purchase.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-heading font-medium text-xs">
                          Company #{purchase.companyId}
                        </td>
                        <td className="p-4 text-heading font-bold">
                          +{purchase.creditsPurchased}
                        </td>
                        <td className="p-4 text-heading font-medium">
                          {purchase.currencySymbol}
                          {purchase.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-muted text-xs">
                          {purchase.currency}
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-xl text-xs font-medium capitalize",
                              purchase.status === "completed" &&
                                "bg-success/10 text-success",
                              purchase.status === "pending" &&
                                "bg-warning/10 text-warning",
                              purchase.status === "failed" &&
                                "bg-danger/10 text-danger"
                            )}
                          >
                            {purchase.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted text-xs font-mono">
                          {purchase.txRef}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

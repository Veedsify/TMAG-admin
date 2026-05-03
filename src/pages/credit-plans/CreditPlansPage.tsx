import { useState } from "react";
import {
  Search,
  Plus,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import { useCreditPlans, useCreateCustomCreditPlan } from "../../api/hooks";
import type { CreditPlan } from "../../api/types";

const emptyForm: Partial<CreditPlan> = {
  displayName: "",
  basePriceUsd: 0,
  basePriceNgn: null,
  description: "",
  signupRangeLabel: "",
  serviceLevel: "STANDARD",
  assignedCompanyId: null,
  planCount: null,
};

export default function CreditPlansPage() {
  const { data: plansData, isLoading } = useCreditPlans();
  const createMutation = useCreateCustomCreditPlan();
  const plans: CreditPlan[] = plansData ?? [];

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<CreditPlan>>(emptyForm);

  const filtered = plans.filter((p) =>
    `${p.displayName} ${p.code} ${p.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const publicCount = plans.filter((p) => p.visibility === "PUBLIC").length;
  const customCount = plans.filter((p) => p.visibility === "CUSTOM").length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createForm, {
      onSuccess: () => {
        setShowCreate(false);
        setCreateForm(emptyForm);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Plans"
        description="Manage public and custom credit plans"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Plans"
          value={plans.length}
          icon={<CreditCard className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Public Plans"
          value={publicCount}
          icon={<Eye className="w-5 h-5" />}
          iconClassName="bg-green-50 text-green-600"
        />
        <StatCard
          label="Custom Plans"
          value={customCount}
          icon={<EyeOff className="w-5 h-5" />}
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            )}
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Custom Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Visibility</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Price (USD)</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Service Level</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Signup Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{plan.displayName}</div>
                      <div className="text-xs text-gray-500">{plan.description}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{plan.code}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                          plan.visibility === "PUBLIC"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {plan.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">${plan.basePriceUsd.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{plan.serviceLevel ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{plan.signupRangeLabel ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No credit plans found</h3>
          <p className="text-sm text-gray-500">
            {search ? "Try adjusting your search." : "Create your first custom plan to get started."}
          </p>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Custom Credit Plan</h2>
              <p className="text-sm text-gray-500 mt-1">
                Custom plans are only visible to the assigned company.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={createForm.displayName ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={createForm.basePriceUsd ?? 0}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, basePriceUsd: parseFloat(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (NGN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.basePriceNgn ?? ""}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        basePriceNgn: e.target.value ? parseFloat(e.target.value) : null,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createForm.description ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Level</label>
                  <select
                    value={createForm.serviceLevel ?? "STANDARD"}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        serviceLevel: e.target.value as "STANDARD" | "PREMIUM" | null,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Signup Range Label</label>
                  <input
                    type="text"
                    value={createForm.signupRangeLabel ?? ""}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, signupRangeLabel: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Company ID</label>
                <input
                  type="number"
                  value={createForm.assignedCompanyId ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      assignedCompanyId: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

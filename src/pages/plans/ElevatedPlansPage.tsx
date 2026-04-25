import { useState, useEffect } from "react";
import { Search, ChevronDown, Loader2, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { cn } from "../../lib/utils";
import axiosInstance from "../../api/axios";
import type { ElevatedPlan } from "../../api/types";

export default function ElevatedPlansPage() {
  const [elevatedPlans, setElevatedPlans] = useState<ElevatedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchElevatedPlans = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/api/v1/admin/plans/elevated", {
          params: { page: 0, size: 50 },
        });
        setElevatedPlans(response.data.data?.content || []);
      } catch (error) {
        console.error("Failed to fetch elevated plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElevatedPlans();
  }, []);

  const filteredPlans = elevatedPlans.filter((p) =>
    p.travellerName.toLowerCase().includes(search.toLowerCase()) ||
    p.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (planId: string) => {
    try {
      setActionLoading(planId);
      await axiosInstance.post(`/api/v1/admin/plans/${planId}/approve`);
      setElevatedPlans(elevatedPlans.filter((p) => p.id !== planId));
      setExpandedPlanId(null);
    } catch (error) {
      console.error("Failed to approve plan:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (planId: string, reason: string) => {
    try {
      setActionLoading(planId);
      await axiosInstance.post(`/api/v1/admin/plans/${planId}/reject`, { reason });
      setElevatedPlans(elevatedPlans.filter((p) => p.id !== planId));
      setExpandedPlanId(null);
    } catch (error) {
      console.error("Failed to reject plan:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const summaryCards = [
    {
      label: "Elevated Plans",
      value: elevatedPlans.length,
      icon: <CheckCircle className="w-4 h-4" />,
      iconClassName: "bg-blue-100 text-blue-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Elevated Travel Plans"
        description="Plans that require senior medical review. Approve or reject with final determination."
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {summaryCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            iconClassName={card.iconClassName}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by traveller name or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No elevated plans at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="p-4 hover:bg-gray-50">
                <button
                  onClick={() =>
                    setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)
                  }
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {plan.travellerName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {plan.destination} • Risk Score: {plan.riskScore}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Elevated by: Dr. {plan.reviewDoctorName}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform flex-shrink-0",
                      expandedPlanId === plan.id ? "rotate-180" : ""
                    )}
                  />
                </button>

                {expandedPlanId === plan.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Doctor Feedback
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-700">
                          {plan.doctorFeedback}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Destination:</span>{" "}
                        {plan.destination}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span>{" "}
                        {plan.duration}
                      </p>
                      <p>
                        <span className="font-medium">Purpose:</span>{" "}
                        {plan.purpose}
                      </p>
                      <p>
                        <span className="font-medium">Risk Score:</span>{" "}
                        {plan.riskScore}
                      </p>
                      <p>
                        <span className="font-medium">Traveller Email:</span>{" "}
                        {plan.travellerEmail}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <button
                        onClick={() => handleReject(plan.id, plan.doctorFeedback)}
                        disabled={actionLoading === plan.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                      >
                        {actionLoading === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(plan.id)}
                        disabled={actionLoading === plan.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                      >
                        {actionLoading === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

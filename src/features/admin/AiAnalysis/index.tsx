import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ShieldAlert, Sprout, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import ClaimRiskAnalyzer from "@/features/admin/AiAnalysis/ClaimRiskAnalyzer";
import CropAdvisoryChat from "@/features/admin/AiAnalysis/CropAdvisoryChat";
import DamageReportSummarizer from "@/features/admin/AiAnalysis/DamageReportSummarizer";

const tabs = [
  {
    id: "claim-risk",
    label: "Claim Risk Analyzer",
    icon: ShieldAlert,
    description: "Detect fraud & assess claim legitimacy",
    color: "text-red-500",
    bg: "bg-red-500/10",
    component: ClaimRiskAnalyzer,
  },
  {
    id: "crop-advisory",
    label: "Crop Advisory",
    icon: Sprout,
    description: "Ask crop & agriculture questions",
    color: "text-green-500",
    bg: "bg-green-500/10",
    component: CropAdvisoryChat,
  },
  {
    id: "damage-report",
    label: "Damage Summarizer",
    icon: FileText,
    description: "Convert raw notes to formal reports",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    component: DamageReportSummarizer,
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AiAnalysis() {
  const [activeTab, setActiveTab] = useState<TabId>("claim-risk");

  const ActiveComponent = tabs.find((t) => t.id === activeTab)!.component;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-green-gradient p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-primary-200 text-sm font-medium mb-0.5">
              Admin Panel • AI Module
            </p>
            <h2 className="font-display text-2xl font-bold">AI Analysis</h2>
            <p className="text-primary-200 text-sm mt-0.5">
              Powered by Google Gemini — crop intelligence at your fingertips
            </p>
          </div>
        </div>
        <div className="absolute top-4 right-6 text-5xl opacity-20">🤖</div>
      </motion.div>

      {/* ── Tab selector cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveTab(tab.id)}
            className={`text-left p-4 rounded-2xl border-2 transition-all duration-200
              ${
                activeTab === tab.id
                  ? "border-primary-500 bg-primary-500/5 shadow-card"
                  : "border-border hover:border-primary-500/40 hover:bg-accent/50"
              }`}
          >
            <div className="flex items-start gap-3">
              <div className={`${tab.bg} p-2.5 rounded-xl shrink-0`}>
                <tab.icon className={`w-5 h-5 ${tab.color}`} />
              </div>
              <div>
                <p
                  className={`text-sm font-semibold
                  ${
                    activeTab === tab.id
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-foreground"
                  }`}
                >
                  {tab.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tab.description}
                </p>
              </div>
            </div>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="mt-3 h-0.5 w-full rounded-full bg-primary-500"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Active feature panel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border p-6">
            <ActiveComponent />
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

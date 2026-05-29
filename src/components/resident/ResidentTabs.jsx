import { motion, AnimatePresence } from "framer-motion";
import ResidentNowTab from "./tabs/ResidentNowTab";
import ResidentPerksTab from "./tabs/ResidentPerksTab";
import ResidentCardTab from "./tabs/ResidentCardTab";
import ResidentSavedTab from "./tabs/ResidentSavedTab";
import ResidentBuildingsTab from "./tabs/ResidentBuildingsTab";
import ResidentPlanTab from "./tabs/ResidentPlanTab";

export default function ResidentTabs({ activeTab, user }) {
  const renderTab = () => {
    switch (activeTab) {
      case "now":
        return <ResidentNowTab user={user} />;
      case "perks":
        return <ResidentPerksTab user={user} />;
      case "plan":
        return <ResidentPlanTab user={user} />;
      case "card":
        return <ResidentCardTab user={user} />;
      case "saved":
        return <ResidentSavedTab user={user} />;
      case "buildings":
        return <ResidentBuildingsTab user={user} />;
      default:
        return <ResidentNowTab user={user} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-hidden"
      >
        {renderTab()}
      </motion.div>
    </AnimatePresence>
  );
}

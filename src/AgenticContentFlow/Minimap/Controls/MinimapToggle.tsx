import ControlButton from "../../Controls/Components/ControlButton";
import { useMinimapStore } from "../store/useMinimapStore";
import { Map } from "lucide-react";

const MinimapToggle = () => {
  const { showMiniMap, setShowMiniMap } = useMinimapStore();

  const handleToggleMiniMap = () => {
    setShowMiniMap(!showMiniMap);
  };

  return (
    <ControlButton
      tooltip="Toggle Mini-Map (M)"
      onClick={handleToggleMiniMap}
      icon={<Map className="size-4" />}
      active={showMiniMap}
    />
  );
};

export default MinimapToggle;

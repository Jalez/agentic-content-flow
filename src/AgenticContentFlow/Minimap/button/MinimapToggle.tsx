import ControlButton from "../../Controls/Components/ControlButton";
import { useMinimapStore } from "../store/useMinimapStore";
import MapIcon from "@mui/icons-material/Map";

const MinimapToggle = () => {
  const { showMiniMap, setShowMiniMap } = useMinimapStore();

  const handleToggleMiniMap = () => {
    setShowMiniMap(!showMiniMap);
  };

  return (
    <ControlButton
      tooltip="Toggle Mini-Map (M)"
      onClick={handleToggleMiniMap}
      icon={<MapIcon fontSize="small" />}
      active={showMiniMap}
    />
  );
};

export default MinimapToggle;

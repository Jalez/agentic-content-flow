import { useEffect } from "react";
import { registerControl } from "../Controls";
import DeleteSelectedButton from "./buttons/DeleteSelected";
import CenterSelectedButton from "./buttons/CenterSelected";
import { CONTROL_TYPES } from "../constants";
import SelectionDisplay from "./SelectionDisplay";

const SelectLogic = () => {
  useEffect(() => {
    // Register the DeleteSelected and CenterSelected control
    registerControl(
      CONTROL_TYPES.NAVIGATION,
      CONTROL_TYPES.MINDMAP,
      "DELETE_SELECTED",
      DeleteSelectedButton,
      {},
      1
    );
    registerControl(
      CONTROL_TYPES.NAVIGATION,
      CONTROL_TYPES.MINDMAP,
      "CENTER_SELECTED",
      CenterSelectedButton,
      {},
      1
    );
  }, []); // Empty dependency array to run only once on mount

  return <SelectionDisplay />;
};

export default SelectLogic;

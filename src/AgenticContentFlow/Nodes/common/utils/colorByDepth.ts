export const colorByDepth = (depth: number) => {
  //different shades of modern 
  const colors = [
   "#f0d1a0",
    "#e1a382", 	
    "#dd6e6e", 	
    "#c34949", 	
    "#9f3d3d"
  ];
  return colors[depth % colors.length];
}
import { CoordinateExtent, Node } from "@xyflow/react";


// Parent nodes in our flow: containers that can hold other nodes
export const flowParentNodesData: Array<Node> = [
  {
    id: "data-source",
    type: "datanode",
    data: {
      label: "Customer Database",
      details: "PostgreSQL database containing customer information",
      level: "basic",
      subject: "data",
      nodeLevel: "basic",
      expanded: false
    },
    position: { x: 50, y: 50 },
  },
  {
    id: "dashboard",
    type: "viewnode",
    data: {
      label: "Analytics Dashboard",
      details: "Main visualization dashboard for customer metrics",
      level: "advanced",
      subject: "visualization",
      nodeLevel: "advanced",
      expanded: false
    },
    position: { x: 600, y: 50 },
  },
  {
    id: "page-container",
    type: "pagenode",
    data: {
      label: "Customer Portal",
      details: "Main page container for customer-facing content",
      level: "intermediate",
      subject: "content",
      nodeLevel: "intermediate",
      expanded: false
    },
    position: { x: 350, y: 300 },
  }
];

// Child nodes in our flow: connect to parent nodes or exist independently
export const flowChildNodesData: Array<Node> = [
  // Data source children
  {
    id: "customer-table",
    type: "cellnode",
    data: {
      label: "Customers Table",
      details: "Contains basic customer information",
      level: "basic",
      subject: "data"
    },
    position: { x: 60, y: 150 },
    parentId: "data-source",
    extent: "parent" as const,
  },
  {
    id: "orders-table",
    type: "cellnode",
    data: {
      label: "Orders Table",
      details: "Contains customer order history",
      level: "basic",
      subject: "data"
    },
    position: { x: 60, y: 220 },
    parentId: "data-source",
    extent: "parent" as const,
  },
  
  // Dashboard children
  {
    id: "sales-chart",
    type: "cellnode",
    data: {
      label: "Sales Chart",
      details: "Visual representation of sales trends",
      level: "advanced",
      subject: "visualization"
    },
    position: { x: 610, y: 150 },
    parentId: "dashboard",
    extent: "parent" as const,
  },
  {
    id: "customer-growth",
    type: "cellnode",
    data: {
      label: "Customer Growth",
      details: "Charts showing customer acquisition metrics",
      level: "advanced",
      subject: "visualization"
    },
    position: { x: 610, y: 220 },
    parentId: "dashboard",
    extent: "parent" as const,
  },
  
  // Page container children
  {
    id: "login-page",
    type: "cellnode",
    data: {
      label: "Login Page",
      details: "Customer authentication page",
      level: "intermediate",
      subject: "content"
    },
    position: { x: 360, y: 380 },
    parentId: "page-container",
    extent: "parent" as const,
  },
  {
    id: "profile-page",
    type: "cellnode",
    data: {
      label: "Profile Page",
      details: "Customer profile management",
      level: "intermediate",
      subject: "content"
    },
    position: { x: 360, y: 450 },
    parentId: "page-container",
    extent: "parent" as const,
  },
  
  // Conditional nodes (not part of any parent)
  {
    id: "is-authenticated",
    type: "conditionalnode",
    data: {
      label: "Is Authenticated?",
      details: "Check if user is logged in",
      level: "basic",
      subject: "logic"
    },
    position: { x: 180, y: 380 },
  },
  {
    id: "has-orders",
    type: "conditionalnode",
    data: {
      label: "Has Orders?",
      details: "Check if customer has any orders",
      level: "basic",
      subject: "logic"
    },
    position: { x: 480, y: 450 },
  }
];

// Combined nodes for easy import - CRITICAL: parent nodes MUST come before child nodes
// React Flow requires parent nodes to be processed before their children
export const flowNodesData = [...flowParentNodesData, ...flowChildNodesData];
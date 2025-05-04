import { Edge } from "@xyflow/react";

// Edge connections for the flow nodes example with the new connection pattern
export const flowEdgesData: Edge[] = [
  // Connect data source tables to the dashboard
  {
    id: "e-customers-sales",
    source: "customer-table",
    target: "sales-chart",
    sourceHandle: "right", // Right side
    targetHandle: "left", // Left side
  },
  {
    id: "e-orders-sales",
    source: "orders-table",
    target: "sales-chart",
    sourceHandle: "right", // Right side
    targetHandle: "left", // Left side
  },
  {
    id: "e-customers-growth",
    source: "customer-table",
    target: "customer-growth",
    sourceHandle: "right", // Right side
    targetHandle: "left", // Left side
  },
  
  // Connect authentication flow - conditional node to login/profile
  {
    id: "e-auth-login",
    source: "is-authenticated",
    target: "login-page",
    sourceHandle: "false", // Not OK - sideways (right)
    targetHandle: "left", // Left side
  },
  {
    id: "e-auth-profile",
    source: "is-authenticated",
    target: "profile-page",
    sourceHandle: "true", // OK - downward (bottom)
    targetHandle: "top", // Top side - receiving from above
  },
  
  // Connect profile to orders check
  {
    id: "e-profile-orders",
    source: "profile-page",
    target: "has-orders",
    sourceHandle: "right", // Right side
    targetHandle: "input", // Top of conditional node
  },
  
  {
    id: "e-orders-table-check",
    source: "orders-table",
    target: "has-orders",
    sourceHandle: "right", // Right side
    targetHandle: "input", // Top of conditional node
  },
];
import { CoordinateExtent, Node } from "@xyflow/react";
import { CourseNodeData } from "../../types";



export const parentNodesData: Array<Node> = [
  {
    id: "course-1",
    type: "pagenode",
    data: {
      label: "Course Group",
      details: "Course overview for Software Testing.",
      level: "advanced",
      subject: "COMP.CS",
      courseCode: "COMP.CS.100",
    },
    position: { x: 50, y: 50 },
    style: {
      width: 300,
      height: 200,
    },
  }, {
    id: "module1",
    type: "pagenode",

    data: {
      label: "Module 1: Introduction to Testing",
      details: "Basics and fundamentals of testing.",
      level: "basic",
      subject: "COMP.CS",
      // handleId: "default",
    },
    style: {
      width: 300,
      height: 200,
    },
    position: { x: 100, y: 100 },
    parentId: "course-1",
    extent: "parent",
  },
  {
    id: "module2",
    type: "pagenode",
    data: {
      label: "Module 2: Advanced Testing Techniques",

      details: "Deep dive into advanced testing methods.",
      level: "advanced",
      subject: "COMP.CS",
      // handleId: "default",
    },
    style: {
      width: 300,
      height: 200,
    },
    position: { x: 550, y: 100 },
    parentId: "course-1",
    extent: "parent",
  },
];

// Nodes for a course group with modules and topics
export const childNodesData: Array<{
  id: string;
  type?: string;
  data: CourseNodeData;
  position: { x: number; y: number };
  style?: Record<string, any>;
  parentId?: string;
  extent?: "parent" | CoordinateExtent;
}> = [

    {
      id: "module1-topic1",
      type: "viewnode",
      data: {
        label: "What is Testing?",
        details: "Definition and importance of testing.",
        level: "basic",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 120, y: 120 },
      parentId: "module1",
      extent: "parent",
    },
    {
      id: "module1-topic2",
      type: "viewnode",

      data: {
        label: "Static vs Dynamic Testing",
        details: "Differences between static and dynamic testing.",
        level: "intermediate",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 120, y: 200 },
      parentId: "module1",
      extent: "parent" as const,
    },
    {
      id: "module1-topic3",
      type: "viewnode",

      data: {
        label: "Tools for Testing",

        details: "Overview of testing tools and frameworks.",
        level: "intermediate",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 120, y: 280 },
      parentId: "module1",
      extent: "parent" as const,
    },
    // Module 2 (Level 1) - Child of Course Group

    // Topics for Module 2 (Level 2) - Children of Module 2
    {
      id: "module2-topic1",
      type: "viewnode",

      data: {
        label: "Test Planning",

        details: "Creating effective test plans.",
        level: "advanced",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 570, y: 120 },
      parentId: "module2",
      extent: "parent" as const,
    },
    {
      id: "module2-topic2",
      type: "viewnode",

      data: {
        label: "Test Execution",

        details: "Strategies for executing tests.",
        level: "advanced",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 570, y: 200 },
      parentId: "module2",
      extent: "parent" as const,
    },
    {
      id: "module2-topic3",
      type: "viewnode",

      data: {
        label: "Test Reporting",

        details: "Documenting and reporting test results.",
        level: "advanced",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 570, y: 280 },
      parentId: "module2",
      extent: "parent" as const,
    },
    {
      //moduless topic
      id: "topic4",
      type: "viewnode",

      data: {
        label: "Test Automation",

        details: "Introduction to test automation.",
        level: "advanced",
        subject: "COMP.CS",
      },
      style: {
        width: 300,
        height: 200,
      },
      position: { x: 570, y: 360 },
    },
  ];


// Exporting all nodes data
export const nodesDataLMSDefault: Array<Node> = [
  ...parentNodesData,
  ...childNodesData,
];
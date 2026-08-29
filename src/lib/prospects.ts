export type Prospect = {
  id: string;
  name: string;
  role: string;
  classYear: string;
  note: string;
};

export const PROSPECTS: Prospect[] = [
  {
    id: "demo-guard",
    name: "Riverside Guard",
    role: "Lead guard · fictional",
    classYear: "2027",
    note: "Seed card. Not a student-athlete. Clip field stays empty without a source.",
  },
  {
    id: "demo-wing",
    name: "Harbor Wing",
    role: "3-and-D · fictional",
    classYear: "2026",
    note: "Demo only. A real card needs gym, date, and a release if the athlete is a minor.",
  },
  {
    id: "demo-big",
    name: "Valley Big",
    role: "Rim runner · fictional",
    classYear: "2028",
    note: "Public names never ship without a consent row. This one is labeled on purpose.",
  },
  {
    id: "demo-combo",
    name: "Pico Combo",
    role: "Secondary creator · fictional",
    classYear: "2027",
    note: "Build-your-board object. Drag is click-to-tier in this demo.",
  },
  {
    id: "demo-stretch",
    name: "Castaic Stretch",
    role: "Floor spacer · fictional",
    classYear: "2026",
    note: "Local flavor, still fictional. Do not treat as scouting copy.",
  },
  {
    id: "demo-anchor",
    name: "Dojo Anchor",
    role: "Drop big · fictional",
    classYear: "2028",
    note: "THE U is the lighthouse program. Real athletes stay off this board until released.",
  },
];

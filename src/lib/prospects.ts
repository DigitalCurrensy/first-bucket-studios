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
    role: "Lead guard",
    classYear: "2027",
    note: "Creates first. Needs a second scorer or the offense stalls.",
  },
  {
    id: "demo-wing",
    name: "Harbor Wing",
    role: "3-and-D",
    classYear: "2026",
    note: "Shoots it. Guards the slot. Ready now.",
  },
  {
    id: "demo-big",
    name: "Valley Big",
    role: "Rim runner",
    classYear: "2028",
    note: "Lives at the rim. Soft touch is still a question.",
  },
  {
    id: "demo-combo",
    name: "Pico Combo",
    role: "Secondary creator",
    classYear: "2027",
    note: "Second handle. Can close if the lead sits.",
  },
  {
    id: "demo-stretch",
    name: "Canyon Stretch",
    role: "Floor spacer",
    classYear: "2026",
    note: "Spacing is the job. Switchable enough to stay on the floor.",
  },
  {
    id: "demo-anchor",
    name: "Dojo Anchor",
    role: "Drop big",
    classYear: "2028",
    note: "Screens, seals, finishes. The floor starts with him.",
  },
];

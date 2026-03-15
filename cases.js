const cases = [
  {
    id: 1,
    victimName: "Daniel Harper",
    killerName: "Lucas Reed",
    weapon: "Kitchen Knife",
    location: "Apartment Kitchen",
    time: "9:15 PM",
    motive: "Financial dispute over stolen business funds",
    witnessType: "Security Camera",
    sceneDetails: "The victim and killer were arguing in the kitchen. The argument escalated and Lucas grabbed a kitchen knife from the counter.",
    clues: "- Loud argument heard around 9 PM\n- A tall male entered the apartment earlier\n- Metallic reflection seen briefly\n- Knife missing from kitchen rack",
    redHerrings: "- A glass breaking sound\n- Neighbor walking past the door"
  },
  {
    id: 2,
    victimName: "Sarah Mitchell",
    killerName: "Olivia Carter",
    weapon: "Poisoned Wine",
    location: "Restaurant Private Room",
    time: "8:40 PM",
    motive: "Revenge for a ruined business partnership",
    witnessType: "Smart Speaker",
    sceneDetails: "The victim and Olivia were meeting privately. Olivia secretly poured poison into Sarah's wine glass.",
    clues: "- Wine bottle opened during conversation\n- Sarah coughing suddenly\n- Olivia leaving quickly\n- Only two voices detected",
    redHerrings: "- Waiter briefly knocking on the door\n- Phone ringing during conversation"
  },
  {
    id: 3,
    victimName: "Marcus Doyle",
    killerName: "Ethan Cross",
    weapon: "Wrench",
    location: "Underground Parking Garage",
    time: "11:10 PM",
    motive: "Blackmail over stolen company data",
    witnessType: "Dashcam",
    sceneDetails: "Marcus confronted Ethan in the parking garage. The confrontation turned violent and Ethan struck Marcus with a wrench.",
    clues: "- Car headlights illuminating two figures\n- Metallic object raised\n- Loud impact sound\n- One person leaving quickly",
    redHerrings: "- Passing car noise\n- Garage door closing"
  }
];

module.exports = cases;

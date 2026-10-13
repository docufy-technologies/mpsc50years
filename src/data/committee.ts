export type Person = {
  name: string;
  title: string;
  /** Short role label shown as a badge, e.g. "Chief Patron" */
  role?: string;
  /** Path under /public, e.g. "/committee/tamim.jpg". Falls back to the placeholder. */
  photo?: string;
};

/** A named person, or a non-person entry (club, batch reps) rendered with an icon. */
export type Member = string | { name: string; group: true };

export type Role = {
  title: string;
  people: Member[];
};

export type RoleGroup = {
  /** Optional sub-heading, e.g. "Day 1" */
  heading?: string;
  roles: Role[];
};

export type Team = {
  id: string;
  name: string;
  supervisors: string[];
  supervisorTitle: string;
  groups: RoleGroup[];
};

export type TeamSection = {
  heading: string;
  teams: Team[];
};

const TRUSTEE = "Member, Board of Trustees";

export const advisingCommittee: Person[] = [
  { name: "Professor Dr. M. Tamim", title: "Chairman, Board of Trustees" },
  { name: "Engineer Moshi Ur Rahman", title: TRUSTEE },
  { name: "Engineer M A Golam Dostagir", title: TRUSTEE },
  { name: "Colonel (Retd.) Gazi Kamal Uddin", title: TRUSTEE },
  { name: "Mr. Jamil Azher", title: TRUSTEE },
  { name: "Mr. Ashfaq Malik", title: TRUSTEE },
  { name: "Mr. Taufiqul Islam", title: TRUSTEE },
  { name: "Mrs. Mehezabeen Z Khan", title: TRUSTEE },
];

export const steeringCommittee: Person[] = [
  {
    name: "Professor Dr. M. Tamim",
    title: "Chairman, Board of Trustees",
    role: "Chief Patron",
  },
  {
    name: "Dr. Md. Anwarul Islam",
    title: "Principal",
    role: "Convener",
  },
];

export const teamSections: TeamSection[] = [
  {
    heading: "Core Committees",
    teams: [
      {
        id: "program-management",
        name: "Program Management Team",
        supervisors: ["Aleya Ferdousi"],
        supervisorTitle: "Vice Principal",
        groups: [
          {
            heading: "Day 1",
            roles: [
              { title: "Program Coordinator", people: ["Iqbal Ahmed"] },
              {
                title: "Stage Manager",
                people: [
                  "Mokbula Monjur",
                  "Sharmin Akter",
                  "Mrs. Arifa Khanom Papia",
                  "Ms. Mohsina Mehejabin",
                ],
              },
              {
                title: "Cultural Sub Team",
                people: [
                  "Tasnima Begum Eli",
                  "Tasnim Tabassum",
                  "Madol Deb Barman",
                  "Shayla Sharmin",
                  "Mohsina Mehejabin",
                ],
              },
              {
                title: "Security & Vigilance Team",
                people: [
                  "Atindra Kumar Das",
                  "Lebas Uddin",
                  "Selim Mia",
                  "Shah Alam Prodhania",
                ],
              },
            ],
          },
          {
            heading: "Day 2",
            roles: [
              { title: "Program Coordinator", people: ["Md. Rezaur Rahman"] },
              {
                title: "Stage Manager",
                people: [
                  "Goutam Kumar Saha Chowdhury",
                  "Mst. Romana Jannatul Jakir",
                  "Md. Kamruzzaman",
                  "Sharmin Akter",
                ],
              },
              {
                title: "Cultural Sub Team",
                people: [
                  "Tasnima Begum Eli",
                  "Rehana Hosne Akhter",
                  "Protap Kumar Mondol",
                  "Saifunnesa Farmin",
                  "Madol Deb Barman",
                ],
              },
              {
                title: "Security & Vigilance Team",
                people: [
                  "Md. Shoaibur Rahman",
                  "Mustafa Nadim Hossain",
                  "Shohrab Hossain Mithun",
                  "Shafiqul Islam",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "alumni-coordination",
        name: "Alumni Coordination Team",
        supervisors: ["Dinesh Chandra Saha"],
        supervisorTitle: "Vice Principal",
        groups: [
          {
            roles: [
              {
                title: "Alumni Lead (Teacher)",
                people: [
                  "Mahbuba Mohsin",
                  "Mohammad Rasheduzzaman",
                  "Zakir Hossain",
                  "Abdul Halim",
                ],
              },
              {
                title: "Alumni Lead (Student)",
                people: [
                  "Syeda Sabera Arefin",
                  "Miraz Rahat (SSC '16)",
                  "Sneha Salam (SSC '18)",
                  "Mehrab Hossain (SSC '19)",
                ],
              },
              {
                title: "Batch Representatives",
                people: [
                  {
                    name: "One/Two individuals from each batch of each branch (selected list)",
                    group: true,
                  },
                ],
              },
              {
                title: "Registration Team (IT Support)",
                people: [
                  "Mohammad Rasheduzzaman",
                  "Saad Ahmed Faisal",
                  "Sohel Ahmmed",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "finance-sponsorship",
        name: "Finance & Sponsorship Team",
        supervisors: ["Khaled Mosharraf"],
        supervisorTitle: "Vice Principal",
        groups: [
          {
            roles: [
              {
                title: "Finance Coordinator",
                people: ["Md. Shahidul Islam", "Md. Shariful Islam"],
              },
              {
                title: "Accounts Manager",
                people: ["Md. Rezaul Shafee", "Fazle Ahmed", "Mohammad Rasel"],
              },
              {
                title: "Sponsorship Manager",
                people: [
                  "K M Masudur Rahman",
                  "Mahmuda Rahman",
                  "Shameem Ara",
                  "Tania Farzana Shurovi",
                  "Ismat Ara",
                  "Syeda Sabera Arefin",
                  "Faria Binte Shams",
                  "Farhin",
                  "Rhythm Rahman",
                  "Rabite Rahman",
                  "Miraz Rahat",
                  "Md. Abir Bhuiyan",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "media-promotion",
        name: "Media & Promotion Team",
        supervisors: ["Tahmina Rahman"],
        supervisorTitle: "Vice Principal",
        groups: [
          {
            roles: [
              {
                title: "Content Lead",
                people: ["Zakir Hossain", "Farzana Haque Nishi", "Md. Noman"],
              },
              {
                title: "Social Media Manager",
                people: [
                  "Mahbuba Mohsin",
                  "Farzana Munmun",
                  "Faria Binte Shams",
                  "Sharafa Amira",
                  "Mahbub Rabbani Sakif",
                ],
              },
              {
                title: "Photography & Videography Team",
                people: [
                  "Mustafa Nadim Hossain",
                  { name: "MPSC Film & Photography Club", group: true },
                  "Saimun Murad",
                  "Ayatul Chowdhury Ayan",
                  "Gazi Umme Sanjeeda Noor",
                  "Rhythm Rahman",
                ],
              },
            ],
          },
        ],
      },
      {
        id: "logistics-hospitality",
        name: "Logistics & Hospitality Team",
        supervisors: ["Kaniz Fatema", "Farah Diba Poly"],
        supervisorTitle: "Vice Principal",
        groups: [
          {
            roles: [
              {
                title: "Venue & Decoration Lead",
                people: [
                  "Md. Rezaul Shafee",
                  "Md. Rezaur Rahman",
                  "Kamruzzoha",
                ],
              },
              {
                title: "Food & Refreshment Coordinator",
                people: [
                  "Md. Shahidul Islam",
                  "Md. Shoaibur Rahman",
                  "ATM Mansurul Islam",
                  "Md. Abdur Rouf",
                ],
              },
              {
                title: "Guest Reception Team (Teacher)",
                people: [
                  "Dil Afroze",
                  "Sumaiya Mehzabeen",
                  "Sonia Chowdhury",
                  "Mahfuza Laila Khan",
                ],
              },
              {
                title: "Guest Reception Team (Student)",
                people: ["Sabrina Afroze Shabonti"],
              },
            ],
          },
        ],
      },
      {
        id: "publication",
        name: "Publication Team",
        supervisors: ["Shahzadi Marjanun Nahar"],
        supervisorTitle: "Vice Principal",
        groups: [
          {
            roles: [
              {
                title: "Publication Coordinator",
                people: ["Prokash Kumar Das", "Sanjeeda Choudhury"],
              },
              {
                title: "Souvenir Editor",
                people: ["Afroza Khatun", "Faruk Ahmed", "Naz Sultana"],
              },
              {
                title: "Content Collection Team",
                people: [
                  "Md. Shariful Islam",
                  "Tasmia Ahmed",
                  "Tania Farzana Shurovi",
                  "Naimur Rahman",
                  { name: "Batch Representatives", group: true },
                ],
              },
              {
                title: "Design & Layout Team",
                people: ["Md. Rezaur Rahman", "Kamruzzoha"],
              },
              {
                title: "Proofreading & Print Liaison",
                people: ["Afroza Khatun", "Faruk Ahmed", "Md. Shariful Islam"],
              },
            ],
          },
        ],
      },
    ],
  },
];

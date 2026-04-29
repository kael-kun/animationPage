export const peopleData = {
  people: [
    {
      id: "p1",
      name: "Elena R.",
      avatar: "https://ui-avatars.com/api/?name=Elena+R&background=0D8ABC&color=fff&size=128",
      letterCount: 87,
      details: {
        role: "Community Lead",
        bio: "Elena has been the heart of our community, organizing weekly meetups and personally writing thank-you notes to every contributor.",
        joined: "2023-02-14"
      }
    },
    {
      id: "p2",
      name: "Marcus T.",
      avatar: "https://ui-avatars.com/api/?name=Marcus+T&background=6B5B95&color=fff&size=128",
      letterCount: 156,
      details: {
        role: "Tech Lead",
        bio: "Marcus built the core infrastructure that powers our platform. His dedication inspires the entire team.",
        joined: "2022-08-20"
      }
    },
    {
      id: "p3",
      name: "Sofia K.",
      avatar: "https://ui-avatars.com/api/?name=Sofia+K&background=EB6841&color=fff&size=128",
      letterCount: 42,
      details: {
        role: "Designer",
        bio: "Sofia crafted the beautiful visual language that makes our platform feel welcoming and intuitive.",
        joined: "2023-05-01"
      }
    },
    {
      id: "p4",
      name: "James L.",
      avatar: "https://ui-avatars.com/api/?name=James+L&background=2C3E50&color=fff&size=128",
      letterCount: 23,
      details: {
        role: "Contributor",
        bio: "James has contributed multiple core features and always goes the extra mile to help newcomers.",
        joined: "2024-01-10"
      }
    },
    {
      id: "p5",
      name: "Aisha M.",
      avatar: "https://ui-avatars.com/api/?name=Aisha+M&background=E91E63&color=fff&size=128",
      letterCount: 95,
      details: {
        role: "Product Manager",
        bio: "Aisha ensures every decision we make aligns with our community's needs and values.",
        joined: "2022-11-15"
      }
    },
    {
      id: "p6",
      name: "David C.",
      avatar: "https://ui-avatars.com/api/?name=David+C&background=FF9800&color=fff&size=128",
      letterCount: 8,
      details: {
        role: "Contributor",
        bio: "David recently joined and has already made meaningful contributions to our documentation.",
        joined: "2024-03-20"
      }
    },
    {
      id: "p7",
      name: "Nina P.",
      avatar: "https://ui-avatars.com/api/?name=Nina+P&background=00BCD4&color=fff&size=128",
      letterCount: 67,
      details: {
        role: "Marketing Lead",
        bio: "Nina has grown our community from 50 to 500+ members through authentic storytelling.",
        joined: "2023-03-08"
      }
    },
    {
      id: "p8",
      name: "Oscar W.",
      avatar: "https://ui-avatars.com/api/?name=Oscar+W&background=795548&color=fff&size=128",
      letterCount: 134,
      details: {
        role: "Senior Developer",
        bio: "Oscar has mentored dozens of junior developers and consistently delivers high-quality code.",
        joined: "2022-06-01"
      }
    },
    {
      id: "p9",
      name: "Luna H.",
      avatar: "https://ui-avatars.com/api/?name=Luna+H&background=9C27B0&color=fff&size=128",
      letterCount: 15,
      details: {
        role: "Contributor",
        bio: "Luna specializes in accessibility improvements, making our platform usable for everyone.",
        joined: "2024-02-14"
      }
    },
    {
      id: "p10",
      name: "Ryan B.",
      avatar: "https://ui-avatars.com/api/?name=Ryan+B&background=4CAF50&color=fff&size=128",
      letterCount: 201,
      details: {
        role: "Founder",
        bio: "Ryan started this movement to celebrate the people who make a difference. Every letter matters.",
        joined: "2021-01-01"
      }
    }
  ]
};

export const connections = [
  ["p1", "p2"],
  ["p1", "p3"],
  ["p1", "p5"],
  ["p2", "p4"],
  ["p2", "p8"],
  ["p3", "p7"],
  ["p4", "p6"],
  ["p5", "p7"],
  ["p5", "p10"],
  ["p6", "p9"],
  ["p7", "p10"],
  ["p8", "p10"],
  ["p9", "p1"],
  ["p3", "p9"]
];
export const ENVIRONMENTS = [
  {
    id: "dream",
    label: "Dream",
    image: "/backgrounds/dream.jpg",
    wash: "from-[#f4c6d7]/40 via-transparent to-[#a78bca]/30",
  },
  {
    id: "rain",
    label: "Rain",
    image: "/backgrounds/rain.jpg",
    wash: "from-[#75639b]/35 via-transparent to-[#242039]/40",
  },
  {
    id: "forest",
    label: "Forest",
    image: "/backgrounds/forest.jpg",
    wash: "from-[#6ee7b7]/20 via-transparent to-[#14532d]/30",
  },
  {
    id: "night",
    label: "Night",
    image: "/backgrounds/night.jpg",
    wash: "from-[#242039]/20 via-transparent to-[#1e1b4b]/45",
  },
] as const;

export type EnvironmentId = (typeof ENVIRONMENTS)[number]["id"];

export function isEnvironmentId(value: string): value is EnvironmentId {
  return ENVIRONMENTS.some((item) => item.id === value);
}

export function environmentById(id: EnvironmentId) {
  return ENVIRONMENTS.find((item) => item.id === id) ?? ENVIRONMENTS[0];
}

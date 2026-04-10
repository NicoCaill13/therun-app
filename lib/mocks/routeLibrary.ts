export const ROUTE_LIBRARY_PROFILE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBt3EvUzKFyJxn-f1YApvtfdHO23PDO9MukKIXEsbrTQRTVzTW2gdvnfNEinIuYfN-Jazw5hpmBxc9hMKzMQEQ_mYF3JZJ9vacw0JZjcNxypmH-5vQaxIYrj_LLf5yQeiPQpdCw12SPsiI-8Un3CxflWIvQJH7_e485LsZIz2esCqMhf5RWyIvMO6OI3YMxVa3Z3C9BZ6LRcYgyI1tJVpf_k8O3n8HCECR0YNnb_DgcyxgPEOnCANCyfAGA-YuOashQchlL3XOZmNQ";

export interface FavoriteRouteMock {
  id: string;
  slugLabel: string;
  title: string;
  distanceKm: string;
  kindLabel: string;
  mapUri: string;
  pathD: string;
}

export const MOCK_FAVORITE_ROUTES: FavoriteRouteMock[] = [
  {
    id: "fav-1",
    slugLabel: "NEUKÖLLN LOOP",
    title: "Urban Night Burn",
    distanceKm: "8.4",
    kindLabel: "ROAD",
    mapUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2NYbfb9JRGGvYBDApEkaZEmS_ckuqC0vPjAx1m60GHcn905qn_JEZqSzTi-BTmrpK6VOqZa7spBKwNi3aFOxYamOO8Ib4pTHPRfKZsq79_1jVxqEQO4BilHE3r2OYPHnH64wHzOIVQZRkzRpFK2DxQayrW828TPl2Zo8FoL7OEfoymhWcc9Konr6LohNrXMvg4nQ6h3MGxLmOgSOe1wkYX9jH4fhK4gz6m_zmF-tq8P6Z5UYcxeXbMDhCkeJjnl8mjzzI4ddNJfo",
    pathD: "M10,80 C30,70 50,90 70,60 S90,20 85,10",
  },
  {
    id: "fav-2",
    slugLabel: "TIERGARTEN EXPRESS",
    title: "Forest Escape",
    distanceKm: "12.2",
    kindLabel: "TRAIL",
    mapUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBxBU02msZjSfa66iezPAZOyUEw-JtQMgHw5ZDBYl77emp-xPdti1yGEYlKFEEDwp1SF81WwICJf12BsUT46P-qMtJBQDjGFTT-aHuVvBAYmxtYLAJMEu9mWn01y9F6IeoLa3RzqGYRkO2ufcEa9cMsOzVPYEHm6fls7KSTsek1e67x9zlqSZhSNbYvjmXJQXA0zwWGvWCQdOKXPWBd9InTbw0OGifPQa30Cpvz6IQ9vamd60JUQRfQNvylwHdFdcFtHraJUvZZc9k",
    pathD: "M20,20 Q50,10 80,40 T20,80",
  },
];

export interface DesktopGridRouteMock {
  id: string;
  metaLabel: string;
  distanceLabel: string;
  elevation: string;
  duration: string;
  levelBadge: string;
  mapUri: string;
}

export const MOCK_DESKTOP_LOCAL_ROUTES: DesktopGridRouteMock[] = [
  {
    id: "desk-1",
    metaLabel: "KREUZBERG LOOP",
    distanceLabel: "12.4 KM",
    elevation: "142M",
    duration: "55m EST",
    levelBadge: "LEVEL 4",
    mapUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlDHCBzoYVLYZkV_L1e7iAw8Px_fJbv06BLJtUF4Ul3pCFjxlvA5UTvk8uOyZwaTyAN32XIgWzNi37_kYcY_veHafUmmYJxXjrhAIy1ffM2Um3XlxUweRraa3yw6jeGSNgKhfduEvtXdTyMNcAilL3WA6XXpkzfdvuTLKox8KMcMppmu9QqAJHovaATaloZNF_32cFHZCs6ZnnTn5bzALgvYiyANwAuZ2jPaYA8smTazibMbejQkewEC_JGfYKG22bgFi48e0muN8",
  },
  {
    id: "desk-2",
    metaLabel: "RIVER FRONTAGE",
    distanceLabel: "08.2 KM",
    elevation: "12M",
    duration: "35m EST",
    levelBadge: "LEVEL 2",
    mapUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_BTt4aZrWtGto-7nQ0ahoJrzq-foew3ieaxq060-8HCp4-JQXjZ_xC8TukO021rXkvEOeWRB2dw541wtl7ClBJXAgT_4vHBIchTNPq3ovfMCYeOhxvfdz9fdROXdIvQxw-hv6DyJBTrdE38wP6oMHbojHK_qwzLTtUcVSHIxTRiUBZ4CP-L0fhcixbB30byVCMYODe9DiKYihwnhLshwv4JETOjs464v4BqiNhNqoneVRFu2fl_GeWeBgRcW25oagKMoF6yaylxc",
  },
  {
    id: "desk-3",
    metaLabel: "RIDGE RUNNER",
    distanceLabel: "21.1 KM",
    elevation: "890M",
    duration: "2h 10m EST",
    levelBadge: "ELITE",
    mapUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5E15v_4toAe4N_mwsBKVEDNqWwJ2IHgbLQJ0S5UtQgY97arRb7rVsvrFRfb3M1ZnncaYYSvkv7_HAST9Kdup_gp7zVeTcJmlgyDzD32RhpQzgseFznTPV4RDtrcnrqS2scRpOQ-mk4oi58J0si_4skO6GysrA_DHHIj9URAQ033fb7nr7IPh3CUrPInoSvvBcIaJu4J7lxZTgRZuRwdsQdjG2X3yxwdHf2bGhQzDv10iJKhrIkanfywbZ9IPpVdX6xtuyW4Is8uw",
  },
];

export const ROUTE_LIBRARY_GLOBAL_HERO_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAORr7BMgPvAn7zqgZSmg7EY-t8GcaKqKbh45ZjjUasJZmzjJL6hVjFk6LZGRhW3XUhKF8QTNq3g4GD8BYXQmJuFe2qVQAwfJtERyxN0axdFYadYBDzpqa02ALHyIwxFTir--zcO45pVSSvFMKuxVVYBVj5JlK2aIfkZUrA3BHsutD4WpCOMOD0ni-HAbZeavsIVpxE82i-IOy0NkJg-J5DDgla3n3bp9rBdQVV6LUyExsXj7KH8IrIqkdvCfCDXWm7QIK8hPsqP_4";

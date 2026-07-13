export type CatProfile = {
  id: string;
  name: string;
  sex: string | null;
  breed: string | null;
  color: string | null;
  birthday: string | null;
  arrival_date: string | null;
  father_info: string | null;
  mother_info: string | null;
  last_vaccine_date: string | null;
  photo_url: string | null;
  microchip_no: string | null;
  vet_clinic: string | null;
  neutered: boolean | null;
  allergy_note: string | null;
  personality_note: string | null;
};

export type CatWeight = {
  id: string;
  measured_date: string;
  weight_kg: number;
  memo: string | null;
};

export type CatPhoto = {
  id: string;
  photo_url: string;
  taken_date: string | null;
};

export type BeetleParent = {
  id: number;
  name: string;
  species: string;
  sex: string | null;
  emerge_date: string | null;
  arrival_date: string | null;
  first_feed_date: string | null;
  death_date: string | null;
  photo_url: string | null;
};

export type BeetleLarva = {
  id: number;
  name: string;
  species: string;
  hatch_date: string;
  note: string | null;
  father_id: number | null;
  mother_id: number | null;
};

export type BeetleWeight = {
  id: string;
  larva_id: number;
  measured_date: string;
  weight_g: number;
};

export type BeetlePhoto = {
  id: string;
  larva_id: number | null;
  parent_id: number | null;
  photo_url: string;
  taken_date: string | null;
};

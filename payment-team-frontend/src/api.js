import regionsData from "./db.json";

export const getRegions = async () => {
  return regionsData;
};

export const getRegionById = async (regionId) => {
  const region = regionsData.find((region) => region.region_id === regionId);
  if (!region) {
    throw new Error("Region not found");
  }
  return region;
};

export const createRegion = async (region) => {
  const newRegion = { ...region };
  regionsData.push(newRegion);
  return newRegion;
};

export const updateRegion = async (region) => {
  const index = regionsData.findIndex((r) => r.region_id === region.region_id);
  if (index === -1) {
    throw new Error("Region not found");
  }
  regionsData[index] = { ...region };
  return regionsData[index];
};

export const deleteRegion = async (regionId) => {
  const index = regionsData.findIndex(
    (region) => region.region_id === regionId
  );
  if (index === -1) {
    throw new Error("Region not found");
  }
  regionsData.splice(index, 1);
};

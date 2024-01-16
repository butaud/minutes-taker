export const upgradeSerializedSession = (oldSession: any) => {
  if (!oldSession.metadata.othersReferenced) {
    oldSession.metadata.othersReferenced = [];
  }
};

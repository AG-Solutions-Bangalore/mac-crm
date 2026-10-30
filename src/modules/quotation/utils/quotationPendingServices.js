const QUOTATION_PREFIX = "mac-crm:quotation-pending-services:";
const REV_QUOTATION_PREFIX = "mac-crm:rev-quotation-pending-services:";

export const quotationPendingKey = (id) => `${QUOTATION_PREFIX}${id}`;
export const revQuotationPendingKey = (id) => `${REV_QUOTATION_PREFIX}${id}`;

const productRowHasData = (product) =>
  Boolean(product.productId) ||
  Boolean(product.notes) ||
  Number(product.price) > 0 ||
  Number(product.quantity) !== 1;

const areaHasData = (area) =>
  Boolean(area.areaId) || area.products.some(productRowHasData);

const floorHasData = (floor) =>
  Boolean(floor.floorId) || floor.areas.some(areaHasData);

const serviceHasData = (srv) =>
  Boolean(srv.serviceId) || srv.floors.some(floorHasData);

const serviceHasCompleteProduct = (srv) =>
  srv.floors.some(
    (floor) =>
      Boolean(floor.floorId) &&
      floor.areas.some(
        (area) =>
          Boolean(area.areaId) &&
          area.products.some((product) => Boolean(product.productId))
      )
  );

const cloneArea = (area) => ({
  ...area,
  products: area.products.map((product) => ({ ...product })),
});

const cloneFloor = (floor) => ({
  ...floor,
  areas: floor.areas.map(cloneArea),
});

const cloneService = (srv) => ({
  ...srv,
  floors: srv.floors.map(cloneFloor),
});

export const sanitizeServicesState = (servicesList) => {
  return servicesList
    .filter((srv) => Boolean(srv.serviceId))
    .map((srv) => ({
      ...srv,
      floors: srv.floors
        .filter((floor) => Boolean(floor.floorId))
        .map((floor) => ({
          ...floor,
          areas: floor.areas
            .filter((area) => Boolean(area.areaId))
            .map((area) => ({
              ...area,
              products: area.products.filter((product) =>
                Boolean(product.productId)
              ),
            }))
            .filter((area) => area.products.length > 0),
        }))
        .filter((floor) => floor.areas.length > 0),
    }))
    .filter((srv) => srv.floors.length > 0);
};

export const extractIncompleteServices = (servicesList) => {
  return (servicesList || [])
    .map((srv) => {
      if (!serviceHasData(srv)) return null;
      if (!srv.serviceId || !serviceHasCompleteProduct(srv)) return srv;

      const floors = srv.floors
        .map((floor) => {
          if (!floor.floorId) return floorHasData(floor) ? floor : null;

          const hasSavedProducts = floor.areas.some(
            (area) =>
              Boolean(area.areaId) &&
              area.products.some((product) => Boolean(product.productId))
          );
          if (!hasSavedProducts) return floorHasData(floor) ? floor : null;

          const areas = floor.areas
            .map((area) => {
              if (!area.areaId) return areaHasData(area) ? area : null;

              const hasSavedRows = area.products.some(
                (product) => product.productId
              );
              if (!hasSavedRows) return areaHasData(area) ? area : null;

              const pendingProducts = area.products.filter(
                (product) => !product.productId && productRowHasData(product)
              );
              return pendingProducts.length > 0
                ? { ...area, products: pendingProducts }
                : null;
            })
            .filter(Boolean);

          return areas.length > 0 ? { ...floor, areas } : null;
        })
        .filter(Boolean);

      return floors.length > 0 ? { ...srv, floors } : null;
    })
    .filter(Boolean);
};

export const hasIncompleteServicesEntries = (servicesList) =>
  extractIncompleteServices(servicesList).length > 0;

export const hasAnyServiceData = (servicesList) =>
  (servicesList || []).some(serviceHasData);

export const mergePendingServiceBlocks = (baseServices, pendingServices) => {
  const merged = (baseServices || []).map(cloneService);

  (pendingServices || []).forEach((pendingSrv) => {
    const targetSrv = pendingSrv.serviceId
      ? merged.find((srv) => srv.serviceId === pendingSrv.serviceId)
      : null;

    if (!targetSrv) {
      merged.push(cloneService(pendingSrv));
      return;
    }

    pendingSrv.floors.forEach((pendingFloor) => {
      const targetFloor = pendingFloor.floorId
        ? targetSrv.floors.find(
            (floor) => floor.floorId === pendingFloor.floorId
          )
        : null;

      if (!targetFloor) {
        targetSrv.floors.push(cloneFloor(pendingFloor));
        return;
      }

      pendingFloor.areas.forEach((pendingArea) => {
        const targetArea = pendingArea.areaId
          ? targetFloor.areas.find(
              (area) => area.areaId === pendingArea.areaId
            )
          : null;

        if (!targetArea) {
          targetFloor.areas.push(cloneArea(pendingArea));
          return;
        }

        targetArea.products.push(
          ...pendingArea.products.map((product) => ({ ...product }))
        );
      });
    });
  });

  return merged;
};

export const savePendingServiceBlocks = (key, servicesState) => {
  if (!key) return;
  try {
    const services = extractIncompleteServices(servicesState);
    if (services.length === 0) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(
      key,
      JSON.stringify({ savedAt: Date.now(), services })
    );
  } catch {
    return;
  }
};

export const loadPendingServiceBlocks = (key) => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.services) ? parsed.services : null;
  } catch {
    return null;
  }
};

export const clearPendingServiceBlocks = (key) => {
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
};

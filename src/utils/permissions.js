export const SALES_USER_TYPE = 4;

export const isSalesUser = (user) => Number(user?.user_type) === SALES_USER_TYPE;

export const getUserAccessRole = (user) =>
  user?.role ||
  user?.access_role ||
  (typeof window !== "undefined" &&
    localStorage.getItem(`user_role_${user?.id}`)) ||
  "editor";

export const isViewerUser = (user) =>
  isSalesUser(user) && getUserAccessRole(user) === "viewer";

export const isQuotationOwnedByUser = (quotation, user) => {
  if (!quotation || !user) return false;

  const preparedId =
    quotation.quotation_prepared_id ??
    quotation.prepared_id ??
    quotation.quotation_prepared_by_id;

  if (
    preparedId !== null &&
    preparedId !== undefined &&
    preparedId !== "" &&
    user.id !== null &&
    user.id !== undefined &&
    Number(preparedId) === Number(user.id)
  ) {
    return true;
  }

  const preparedName =
    quotation.prepared_name ||
    quotation.quotation_prepared_name ||
    quotation.prepared_by;

  if (preparedName && user.name) {
    if (
      String(preparedName).trim().toLowerCase() ===
      String(user.name).trim().toLowerCase()
    ) {
      return true;
    }
  }

  const preparedEmail =
    quotation.prepared_email || quotation.quotation_prepared_email;

  if (preparedEmail && user.email) {
    if (
      String(preparedEmail).trim().toLowerCase() ===
      String(user.email).trim().toLowerCase()
    ) {
      return true;
    }
  }

  const preparedMobile =
    quotation.prepared_mobile || quotation.quotation_prepared_mobile;
  const userMobile = user.mobile || user.phone;

  if (preparedMobile && userMobile) {
    const preparedDigits = String(preparedMobile).replace(/\D/g, "");
    const userDigits = String(userMobile).replace(/\D/g, "");
    if (
      preparedDigits &&
      userDigits &&
      preparedDigits.slice(-10) === userDigits.slice(-10)
    ) {
      return true;
    }
  }

  return false;
};

// All investor data stays on your device — never in the repo or published

export const getConviction = (id: string): number => {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(`cv_${id}`)) || 0;
};

export const setConviction = (id: string, n: number) => {
  localStorage.setItem(`cv_${id}`, String(n));
};

export const getStatus = (id: string): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`st_${id}`) ?? "";
};

export const setStatus = (id: string, s: string) => {
  if (s) localStorage.setItem(`st_${id}`, s);
  else localStorage.removeItem(`st_${id}`);
};

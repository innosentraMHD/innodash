export const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayDate = () => formatLocalDate(new Date());
export const getFirstDayOfMonth = () => formatLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
export const getLastDayOfMonth = () => formatLocalDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

export const getDatesInRange = (start, end) => {
  const arr = [];
  let cur = new Date(`${start}T00:00:00`);
  let en = new Date(`${end}T00:00:00`);
  while (cur <= en) {
    arr.push(formatLocalDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return arr;
};

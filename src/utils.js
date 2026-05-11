// src/utils.js

/**
 * يرجع تاريخ اليوم بصيغة YYYY-MM-DD
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * يرجع تاريخ أول يوم في الشهر الحالي بصيغة YYYY-MM-DD
 */
export const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

/**
 * يرجع تاريخ آخر يوم في الشهر الحالي بصيغة YYYY-MM-DD
 */
export const getLastDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
};

/**
 * يرجع مصفوفة بكل التواريخ الواقعة بين تاريخين (شامل البداية والنهاية)
 * يستخدم لرسم الشارت البياني (Trend Chart)
 */
export const getDatesInRange = (startDate, endDate) => {
  const dateArray = [];
  let currentDate = new Date(startDate);
  const stopDate = new Date(endDate);

  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate).toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
};
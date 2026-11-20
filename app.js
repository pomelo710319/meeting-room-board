// ===== 衝突檢查 =====

// 找出同會議室、同日期、時段重疊的預約（首尾相接不算）；沒有則回傳 undefined
function findConflict(bookings, newBooking) {
  return bookings.find(b =>
    b.room === newBooking.room &&
    b.date === newBooking.date &&
    newBooking.start < b.end &&
    newBooking.end > b.start
  );
}

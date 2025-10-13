function bookQueue(doctorName) {
  alert(`คุณต้องการจองคิวกับ ${doctorName} ใช่หรือไม่?`);
}

function submitAppointment(event) {
  event.preventDefault();
  alert("ส่งคำขอจองคิวเรียบร้อยแล้ว ขอบคุณค่ะ!");
}

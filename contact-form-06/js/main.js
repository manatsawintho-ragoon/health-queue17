(function ($) {
  "use strict";

  // รอ DOM พร้อมก่อนค่อยผูก validate
  $(function initValidation() {
    $("#contactForm").validate({
      errorClass: "is-invalid",
      validClass: "is-valid",
      errorElement: "small",
      errorPlacement: function (error, element) {
        error.addClass("text-danger d-block");
        error.insertAfter(element);
      },

      // กติกา
      rules: {
        name:    { required: true, minlength: 2 },
        subject: { required: true, minlength: 2 },
        email:   { required: true, email: true },
        message: { required: true, minlength: 5 }
      },

      // ข้อความไทย
      messages: {
        name: {
          required: "กรุณากรอกชื่อ-นามสกุล",
          minlength: "กรุณากรอกอย่างน้อย 2 ตัวอักษร"
        },
        subject: {
          required: "กรุณากรอกหัวข้อ",
          minlength: "กรุณากรอกอย่างน้อย 2 ตัวอักษร"
        },
        email: {
          required: "กรุณากรอกอีเมล",
          email: "กรุณากรอกอีเมลให้ถูกต้อง"
        },
        message: {
          required: "กรุณากรอกรายละเอียด",
          minlength: "กรุณากรอกอย่างน้อย 5 ตัวอักษร"
        }
      },

      // ส่งฟอร์มแบบ AJAX เมื่อผ่าน validation
      submitHandler: function (form) {
        var $form  = $(form);
        var $spin  = $(".submitting");
        var $ok    = $("#form-message-success");
        var $warn  = $("#form-message-warning");
        var waitText = "กำลังส่ง...";

        $ok.hide();
        $warn.hide();

        $.ajax({
          type: "POST",
          url: "php/sendEmail.php",    // ปรับปลายทางตามจริง
          data: $form.serialize(),
          beforeSend: function () {
            $spin.css("display", "block").text(waitText);
          },
          success: function (res) {
            // รองรับทั้ง "OK" ตรงๆ หรือ JSON { ok: true, ... }
            var ok = false;
            if (typeof res === "string") {
              res = res.trim();
              ok = (res === "OK");
              if (!ok) {
                // พยายาม parse JSON ถ้าไม่ใช่ "OK"
                try { ok = !!JSON.parse(res).ok; } catch (e) {}
              }
            } else if (res && typeof res === "object") {
              ok = !!res.ok;
            }

            if (ok) {
              $warn.hide();
              $ok.text("✅ ข้อความของคุณถูกส่งแล้ว").fadeIn();

              // เคลียร์ฟอร์ม + รีเซ็ตสถานะ input
              form.reset();
              $form.find(".is-valid, .is-invalid").removeClass("is-valid is-invalid");

              // ซ่อนแจ้งเตือนสำเร็จภายหลัง
              setTimeout(function () { $ok.fadeOut(); }, 8000);
            } else {
              // ถ้าแบ็กเอนด์ส่งข้อความ error กลับมา ให้แสดง; ไม่งั้นใช้ข้อความเริ่มต้น
              var msg = (typeof res === "string" && res !== "OK" && res !== "") ?
                        res : "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง";
              $warn.html(msg).fadeIn();
            }
          },
          error: function () {
            $warn.html("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง").fadeIn();
          },
          complete: function () {
            $spin.css("display", "none").text(waitText);
          }
        });

        return false; // กัน submit ปกติ
      }
    });
  });
})(jQuery);

// src/data/services.js

import acneImg from "../assets/Services_img/Acne-treatment.png";
import facialImg from "../assets/Services_img/Facial-treatment.png";
import laserImg from "../assets/Services_img/Laser-treatment.png";
import whiteningImg from "../assets/Services_img/Whitening-treatment.png";
import fillerImg from "../assets/Services_img/Filer-treatment.png";

export const services = [
  {
    id: 1,
    title: "รักษาสิวครบวงจร",
    description:
      "ดูแลทุกปัญหาสิว ตั้งแต่สิวอุดตัน สิวอักเสบ รอยดำรอยแดง ไปจนถึงการฟื้นฟูผิวหลังสิว โดยทีมแพทย์เฉพาะทาง",
    image: acneImg,
    category: "Acne Care",
  },
  {
    id: 2,
    title: "ทรีตเมนต์บำรุงผิวหน้า",
    description:
      "ปรับสมดุล ฟื้นฟูผิวหน้าให้แข็งแรง ชุ่มชื้น และลดเลือนริ้วรอย ด้วยทรีตเมนต์สูตรเฉพาะของ WHOCARE",
    image: facialImg,
    category: "Facial Treatment",
  },
  {
    id: 3,
    title: "เลเซอร์หน้าใส",
    description:
      "ลดรอยสิว ฝ้า กระ จุดด่างดำ ด้วยเทคโนโลยีเลเซอร์ที่ทันสมัย ช่วยให้ผิวดูกระจ่างใสอย่างเป็นธรรมชาติ",
    image: laserImg,
    category: "Laser Skin Rejuvenation",
  },
  {
    id: 4,
    title: "ทรีตเมนต์ผิวขาวใส",
    description:
      "เพิ่มความกระจ่างใสให้ผิวหน้าและผิวกาย ด้วยสูตรบำรุงเข้มข้น ช่วยให้ผิวเปล่งประกายสุขภาพดี",
    image: whiteningImg,
    category: "Brightening Treatment",
  },
  {
    id: 5,
    title: "ฟิลเลอร์ & โบท็อกซ์",
    description:
      "ปรับรูปหน้า ยกกระชับ ลดริ้วรอย ให้ใบหน้าดูอ่อนเยาว์อย่างเป็นธรรมชาติ ด้วยผลิตภัณฑ์คุณภาพสูงและเทคนิคปลอดภัย",
    image: fillerImg,
    category: "Aesthetic Enhancement",
  },
];

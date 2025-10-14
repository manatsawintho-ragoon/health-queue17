import React from "react";
import Navbar from "../components/Navbar";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import PsychologyIcon from "@mui/icons-material/Psychology";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AccessibilityIcon from "@mui/icons-material/Accessibility";

export default function QueuePage() {
  const services = [
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
      title: "ตรวจสุขภาพทั่วไป",
      desc: "บริการตรวจสุขภาพประจำปี ตรวจเลือด และให้คำปรึกษากับแพทย์เฉพาะทาง",
    },
    {
      icon: <VaccinesIcon sx={{ fontSize: 40 }} />,
      title: "ศูนย์ฉีดวัคซีน",
      desc: "ให้บริการวัคซีนสำหรับเด็กและผู้ใหญ่ เช่น วัคซีนไข้หวัดใหญ่ HPV และโควิด-19",
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
      title: "ศูนย์หัวใจ",
      desc: "ตรวจคลื่นไฟฟ้าหัวใจ (EKG) และดูแลผู้ป่วยโรคหัวใจโดยแพทย์ผู้เชี่ยวชาญ",
    },
    {
      icon: <MonitorHeartIcon sx={{ fontSize: 40 }} />,
      title: "คลินิกเวชศาสตร์การกีฬา",
      desc: "ดูแลอาการบาดเจ็บจากการเล่นกีฬา และฟื้นฟูสภาพร่างกายให้พร้อมใช้งาน",
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "คลินิกสุขภาพจิต",
      desc: "บริการปรึกษานักจิตวิทยาและจิตแพทย์ เพื่อส่งเสริมสุขภาพใจของคุณ",
    },
    {
      icon: <AccessibilityIcon sx={{ fontSize: 40 }} />,
      title: "กายภาพบำบัด",
      desc: "ฟื้นฟูผู้ป่วยหลังผ่าตัด อุบัติเหตุ หรือผู้สูงอายุ โดยทีมกายภาพมืออาชีพ",
    },
  ];

  return (
    <>
      <Navbar />
      <Box
        sx={{
          background: "linear-gradient(135deg, #0097a7 0%, #00acc1 100%)",
          color: "white",
          py: 10,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h6"
            sx={{ letterSpacing: 1, fontWeight: 400, mb: 1 }}
          >
            Our Services
          </Typography>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Explore Our Services
          </Typography>
          <Typography
            variant="body1"
            sx={{ opacity: 0.8, mb: 8, maxWidth: "700px", mx: "auto" }}
          >
            เรามีทีมแพทย์และบุคลากรทางการแพทย์พร้อมให้บริการตรวจ วินิจฉัย
            และรักษาอย่างครบวงจร
          </Typography>

          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
            sx={{
              maxWidth: "1200px",
              margin: "0 auto",
              px: 4,
            }}
          >
            {services.map((s, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                  sx={{
                    width: "100%",
                    height: 300,
                    borderRadius: 4,
                    p: 3,
                    backgroundColor: "white",
                    color: "black",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    mx: "auto",
                    textAlign: "center",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box textAlign="center">
                    <Avatar
                      sx={{
                        bgcolor: "#00acc1",
                        width: 64,
                        height: 64,
                        mb: 2,
                        margin: "auto",
                      }}
                    >
                      {s.icon}
                    </Avatar>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      textAlign="center"
                    >
                      {s.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ mb: 2 }}
                    >
                      {s.desc}
                    </Typography>
                  </Box>

                  <Box textAlign="center">
                    <Button
                      variant="text"
                      sx={{
                        color: "#0097a7",
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      ดูรายละเอียดเพิ่มเติม
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}

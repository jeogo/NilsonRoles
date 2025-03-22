"use client";
import { FC, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Schedule, Link as LinkIcon } from "@mui/icons-material";

interface ReportHeaderProps {
  data?: any;
}

const ReportHeader: FC<ReportHeaderProps> = ({ data }) => {
  const router = useRouter();
  const [dateTime, setDateTime] = useState({ date: "", time: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Use en-US locale to ensure Western numerals for dates
    setDateTime({
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }, []);

  // To avoid hydration errors, don't render date/time content until mounted
  if (!mounted) return null;

  // Get domain from data or use placeholder
  const domain = data?.websiteUrl || "https://www.data.com";
  const analysisNumber = "1234567"; // Western numerals

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mb: 4,
        borderRadius: 4,
        background: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "8px",
          height: "100%",
          backgroundColor: (theme) => theme.palette.primary.main,
        },
        "@media print": {
          boxShadow: "none",
          border: "1px solid #ccc",
        },
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.25rem" },
                backgroundImage: "linear-gradient(45deg, #1a365d, #2c6faa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: { xs: 1, md: 0 },
              }}
            >
              تقرير تحليل الموقع
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  background: "linear-gradient(45deg, #1a365d, #2c6faa)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #15294a, #265d91)",
                  },
                }}
                onClick={() => router.push("/")} // Replace with your target page
              >
                تحليل جديد{" "}
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: "rgba(26, 54, 93, 0.05)",
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 4, mb: 1 }}>
                <LinkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium" sx={{ ml: 1 }}>
                  الموقع:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: (theme) => theme.palette.primary.main,
                    fontWeight: "bold",
                    ml: 1,
                    fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.25rem" },
                  }}
                >
                  {domain}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Schedule fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  تاريخ الفحص:{" "}
                  <span style={{ fontWeight: "bold" }}>{dateTime.date}</span>
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`تحليل كامل #${analysisNumber}`}
              color="primary"
              sx={{
                fontWeight: "bold",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                background: "linear-gradient(45deg, #1a365d, #2c6faa)",
              }}
            />
            <Chip
              label="الجوال"
              variant="outlined"
              sx={{
                borderColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.main,
              }}
            />
            <Chip
              label="سطح المكتب"
              variant="outlined"
              sx={{
                borderColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.main,
              }}
            />
            <Chip
              label="مبادئ نيلسون"
              color="secondary"
              sx={{
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Box>
        </Grid>
      </Grid>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mt: 3,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        مصدر البيانات: واجهات PageSpeed و HTML و Security
      </Typography>
    </Paper>
  );
};

export default ReportHeader;
